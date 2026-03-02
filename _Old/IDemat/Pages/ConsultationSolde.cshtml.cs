using IDemat.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QRCoder;
using srPayFip;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;

namespace IDemat.Pages
{
    public class ConsultationSoldeModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public ConsultationSoldeModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [BindProperty(SupportsGet = true)]
        public Guid guidUsager { get; set; }
        [BindProperty]
        public Usager Identifiant { get; set; }
        [BindProperty]
        public IDemat.Global.Variables Variables { get; set; }
        public IQueryable<AchatPassages> MesAchatsPassages { get; set; }
        public IQueryable<AchatPassagesPayFip> MesAchatsPassagesEnCours { get; set; }

        //private readonly ILogger<IndexModel> _logger;

        //public IndexModel(ILogger<IndexModel> logger)
        //{
        //    _logger = logger;
        //}


        public async Task<IActionResult> OnGet(string usagerGuid)
        {
            Variables = new IDemat.Global.Variables();
            int intErreur = 0;

            try
            {
                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));

                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                if (Variables.usageractif != null)
                {
                    Variables.guidUsager = guidUsager;
                    Variables.idEnseigne = _context.Usagers.Where(u => u.GuidUsager == guidUsager).FirstOrDefault().IdEnseigne;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + Variables.idEnseigne.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                    Variables.nomUsager = Variables.usageractif.Nom;

                    //Récupérations PayFip
                    try
                    {
                        MesAchatsPassagesEnCours = _context.AchatsPassagesPayFip.Where(d => d.resultrans == null && d.GuidUsager == Variables.guidUsager).OrderBy(d => d.DateAchat);
                        foreach (AchatPassagesPayFip monAchat in MesAchatsPassagesEnCours)
                        {
                            try
                            {
                                bool blnGO = false;
                                if (monAchat.DateHeureInterrogation == null)
                                {
                                    blnGO = true;
                                }
                                else
                                {
                                    if (Math.Abs((DateTime.Now - monAchat.DateHeureInterrogation.Value).TotalMinutes) > 30)
                                    {
                                        blnGO = true;
                                    }
                                }

                                if (blnGO)
                                {
                                    AchatPassagesPayFip achatpassagesPF = _context.AchatsPassagesPayFip.Where(a => a.idop == monAchat.idop).FirstOrDefault();
                                    if (achatpassagesPF != null)
                                    {
                                        achatpassagesPF.DateHeureInterrogation = DateTime.Now;

                                        _context.AchatsPassagesPayFip.Update(achatpassagesPF);
                                    }

                                    var requestbisSOAP = new srPayFip.RecupererDetailPaiementSecuriseRequest
                                    {
                                        idOp = monAchat.idop
                                    };

                                    var clientSOAP = new srPayFip.PaiementSecuriseServiceClient();

                                    recupererDetailPaiementSecuriseResponse1 response1bisSOAP = await clientSOAP.recupererDetailPaiementSecuriseAsync(requestbisSOAP);

                                    RecupererDetailPaiementSecuriseResponse responsebisSOAP = response1bisSOAP.@return;

                                    Variables.detailPaiement = responsebisSOAP;

                                    clientSOAP.Close();

                                    //Envoi mail test
                                    string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - interrogation PayFip depuis ConsultationSolde - " + monAchat.idop, "idop : " + Variables.detailPaiement.idOp + "- Objet : " + Variables.detailPaiement.objet + "- Résultat(P= paiement effectif ; A=abandon ; R=autres cas (paiement refusé)) : " + Variables.detailPaiement.resultrans + "- Date de transaction : " + Variables.detailPaiement.dattrans + "- Heure de transaction : " + Variables.detailPaiement.heurtrans + "- Numéro autorisation CB : " + Variables.detailPaiement.numauto);
                                    //return Page();

                                    if (achatpassagesPF != null)
                                    {
                                        achatpassagesPF.objet = Variables.detailPaiement.objet;
                                        achatpassagesPF.resultrans = Variables.detailPaiement.resultrans;
                                        achatpassagesPF.dattrans = Variables.detailPaiement.dattrans;
                                        achatpassagesPF.heurtrans = Variables.detailPaiement.heurtrans;
                                        achatpassagesPF.numauto = Variables.detailPaiement.numauto;

                                        _context.AchatsPassagesPayFip.Update(achatpassagesPF);
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                                //return RedirectToPage("./Error", new { strMessage = ex.Message });
                                string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - erreur interrogation PayFip depuis ConsultationSolde1 - ", ex.Message);
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                        //return RedirectToPage("./Error", new { strMessage = ex.Message });
                        string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - erreur interrogation PayFip depuis ConsultationSolde2 - ", ex.Message);
                    }

                    MesAchatsPassages = _context.AchatsPassages.Where(d => d.GuidUsager == Variables.usageractif.GuidUsager && d.DateAchat.Substring(0,4) == DateTime.Now.Year.ToString()).OrderByDescending(d => d.DateAchat);
                    Variables.nbPassagesAchetesAnnee = _context.AchatsPassages.Where(d => d.GuidUsager == Variables.usageractif.GuidUsager).Sum(d => d.NbPassages);
                    Variables.nbPassagesSeuilAnnee = _context.Seuils.Where(d => d.idEnseigne == Variables.idEnseigne && d.TypeSeuil == "P" && d.Periode == "A").FirstOrDefault()?.NbPassages ?? 0;
                    Variables.blnPossibiliteAchatPassages = (_context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().NbPassagesAchetables is not null);
                    //return Page();
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/panda/");
                    return RedirectToPage("./Error", new { strMessage = "" });
                }

                Variables.usagernbpassagesanneeactif = _context.UsagerNbPassagesAnnee.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                if (Variables.usagernbpassagesanneeactif != null)
                {                    
                    //Variables.nbPassagesAnnee = Variables.usagernbpassagesanneeactif.NbPassages;

                    return Page();
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/panda/");
                    return RedirectToPage("./Error", new { strMessage = "Nombre de passages de l'usager inconnu" });
                }
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        private string EnvoiMail(string A, string Sujet, string Corps)
        {
            try
            {
                MailMessage message = new MailMessage();

                byte[] reader = System.IO.File.ReadAllBytes(Path.Combine(_environment.ContentRootPath, "wwwroot/Images", "picto_mail.jpg"));
                MemoryStream image1 = new MemoryStream(reader);
                AlternateView av = AlternateView.CreateAlternateViewFromString(Corps, null, System.Net.Mime.MediaTypeNames.Text.Html);

                LinkedResource picto = new LinkedResource(image1, System.Net.Mime.MediaTypeNames.Image.Jpeg);
                picto.ContentId = "pictomail";
                picto.ContentType = new System.Net.Mime.ContentType("image/jpg");
                av.LinkedResources.Add(picto);

                message.IsBodyHtml = true;
                message.From = new MailAddress(_config.GetValue<string>("IDbat:Expediteur"));

                string[] strMailTos = A.Split(";");
                foreach (string strMailTo in strMailTos)
                {
                    message.To.Add(new MailAddress(strMailTo));
                }
                //message.To.Add(new MailAddress("bertrand@hermess.fr"));

                message.Subject = Sujet;
                //message.Body = Corps;

                message.AlternateViews.Add(av);

                System.Net.Mime.ContentType mimeType = new System.Net.Mime.ContentType("text/html");
                AlternateView alternate = AlternateView.CreateAlternateViewFromString(Corps, mimeType);
                message.AlternateViews.Add(alternate);

                SmtpClient client = new SmtpClient(_config.GetValue<string>("IDbat:IP_SMTP"));

                client.SendAsync(message, "");

                return A;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                EnregistreErreurEnvoiMail(ex, A, Sujet, Corps, "");
                return ex.Message;
            }
        }

        private bool EnregistreErreurEnvoiMail(Exception exEnvoiMail, string A, string Sujet, string Corps, string PieceJointe)
        {
            try
            {
                _context.Database.ExecuteSqlRaw("INSERT INTO TB_ERREURSENVOIMAIL (STR_DATEHEURE, STR_ERREUR, STR_SUJET, STR_DESTINATAIRES, STR_CORPS, BLN_PIECESJOINTES) VALUES ('" + DateTime.Now.ToString("yyyyMMddHHmmss") + "','" + exEnvoiMail.Message.Replace("'", "''") + "','" + Sujet.Replace("'", "''") + "','" + A.Replace("'", "''") + "','" + Corps.Replace("'", "''") + "'," + (PieceJointe != "" ? 1 : 0).ToString() + ")");

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

    }
}
