using IDemat.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using srPayFip;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;

namespace IDemat.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public IndexModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [BindProperty(SupportsGet = true)]
        public string contrat { get; set; }
        [BindProperty]
        public Usager Identifiant { get; set; }
        [BindProperty]
        public IDemat.Global.Variables Variables { get; set; }

        public IQueryable<AchatPassagesPayFip> MesAchatsPassagesEnCours { get; set; }
        //private readonly ILogger<IndexModel> _logger;

        //public IndexModel(ILogger<IndexModel> logger)
        //{
        //    _logger = logger;
        //}

        public async Task<IActionResult> OnGet()
        {
            Variables = new IDemat.Global.Variables();

            try
            {
                Contrat contratencours = _context.Contrats.Where(c => c.URL.ToLower() == contrat.ToLower()).FirstOrDefault();

                if (contratencours != null)
                {
                    Variables.idEnseigne = contratencours.Id;
                    Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
                    Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                    //try
                    //{
                    //    using (HttpClient client = new HttpClient())
                    //    {
                    //        HttpResponseMessage response = await client.SendAsync(new HttpRequestMessage(HttpMethod.Get, Variables.strURLLogo));
                    //        if (!response.IsSuccessStatusCode)
                    //        {
                    //            Variables.strURLLogo = Variables.strURLLogo.Replace(".jpg", ".png");
                    //        }
                    //    }
                    //}
                    //catch
                    //{
                    //    Variables.strURLLogo = Variables.strURLLogo.Replace(".jpg", ".png");
                    //}
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/panda/");
                    return RedirectToPage("./Error", new { strMessage = "" });
                }
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }


            //Récupérations PayFip
            try
            {
                MesAchatsPassagesEnCours = _context.AchatsPassagesPayFip.Where(d => d.resultrans == null).OrderBy(d => d.DateAchat);
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
                            string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - interrogation PayFip - " + monAchat.idop, "idop : " + Variables.detailPaiement.idOp + "- Objet : " + Variables.detailPaiement.objet + "- Résultat(P= paiement effectif ; A=abandon ; R=autres cas (paiement refusé)) : " + Variables.detailPaiement.resultrans + "- Date de transaction : " + Variables.detailPaiement.dattrans + "- Heure de transaction : " + Variables.detailPaiement.heurtrans + "- Numéro autorisation CB : " + Variables.detailPaiement.numauto);
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
                        string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - erreur interrogation PayFip - ", ex.Message);
                    }
                }
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                //return RedirectToPage("./Error", new { strMessage = ex.Message });
                string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - erreur interrogation PayFip - ", ex.Message);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostIdentifierAsync()
        {
            if (!ModelState.IsValid)
            {

                Variables.idEnseigne = Identifiant.IdEnseigne;

                string strURL = _config.GetValue<string>("IDbat:URLLogos");
                if (!strURL.EndsWith("/"))
                {
                    strURL += "/";
                }
                strURL += "Logo_";
                Variables.strURLLogo = strURL + Variables.idEnseigne.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                return Page();
            }

            try
            {
                //Contrat contratencours = _context.Contrats.Where(c => c.URL.ToLower() == contrat.ToLower()).FirstOrDefault();
                Contrat contratencours = _context.Contrats.Where(c => c.Id == Identifiant.IdEnseigne).FirstOrDefault();

                if (contratencours != null)
                {
                    Variables.idEnseigne = contratencours.Id;
                    Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
                    Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                }
                else
                {
                    return RedirectToPage("./Error", new { strMessage = "" });
                }

                Variables.erreurLogin = false;
                Variables.erreurMotdepasse = false;

                Usager usagerencours = _context.Usagers.Where(c => c.IdEnseigne == Identifiant.IdEnseigne && c.Login.ToLower() == Identifiant.Login.ToLower()).FirstOrDefault();
                if (usagerencours == null)
                {
                    Variables.idEnseigne = Identifiant.IdEnseigne;
                    Variables.erreurLogin = true;
                    return Page();
                }

                usagerencours = _context.Usagers.Where(c => c.IdEnseigne == Identifiant.IdEnseigne && c.Login.ToLower() == Identifiant.Login.ToLower() && c.Motdepasse == Crypto.Crypte(Identifiant.Motdepasse)).FirstOrDefault();
                if (usagerencours == null)
                {
                    Variables.idEnseigne = Identifiant.IdEnseigne;
                    Variables.erreurMotdepasse = true;
                    return Page();
                }

                ////Vérification si pas en liste noire pour motif "Suppression volontaire par l'usager" (pour les autres motifs, on laisse entrer, ce sera traité à la lecture en déchetterie)
                //int idMotif = _context.RefsListesNoires.Where(r => r.Libelle == "Suppression volontaire par l'usager").FirstOrDefault().IdMotifPerteVol;
                //ListeNoire listenoire = _context.ListesNoires.Where(l => l.IdUsager == usagerencours.IdUsager && l.IDMotifListeNoire == idMotif).FirstOrDefault();
                //if (listenoire != null)
                //{
                //    Variables.idEnseigne = Identifiant.IdEnseigne;
                //    Variables.erreurCompteSupprime = true;
                //    return Page();
                //}

                Variables.idEnseigne = Identifiant.IdEnseigne;

                //Si mot de passe jamais changé, on va sur l'écran de modification
                if (!usagerencours.MotdepasseChange)
                {
                    Variables.idEnseigne = Identifiant.IdEnseigne;
                    return RedirectToPage("./ModificationMotDePasseProvisoire", new { usagerGuid = Crypto.Crypte(usagerencours.GuidUsager.ToString()) });
                }
                else
                {
                    Variables.idEnseigne = Identifiant.IdEnseigne;
                    return RedirectToPage("./Menu", new { usagerGuid = Crypto.Crypte(usagerencours.GuidUsager.ToString()) });
                }

            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + "/");
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

        private string EnvoiMailSansImage(string A, string Sujet, string Corps)
        {
            try
            {
                MailMessage message = new MailMessage();

                message.IsBodyHtml = false;
                message.From = new MailAddress("idbatdev@veolia.com");

                string[] strMailTos = A.Split(";");
                foreach (string strMailTo in strMailTos)
                {
                    message.To.Add(new MailAddress(strMailTo));
                }

                message.Subject = Sujet;
                message.Body = Corps;

                SmtpClient client = new SmtpClient("10.254.10.161");

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
