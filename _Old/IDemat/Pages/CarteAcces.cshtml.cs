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
    public class CarteAccesModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public CarteAccesModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
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
                Variables.usagerqrcodeactif = _context.UsagersQRCode.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                if (Variables.usagerqrcodeactif != null)
                {
                    Variables.guidUsager = guidUsager;
                    Variables.nomUsager = Variables.usagerqrcodeactif.Nom;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + _context.Usagers.Where(u => u.GuidUsager == guidUsager).FirstOrDefault().IdEnseigne.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                    QRCodeGenerator QrGenerator = new QRCodeGenerator();
                    QRCodeData QrCodeInfo = QrGenerator.CreateQrCode(Variables.usagerqrcodeactif.CB.Trim(), QRCodeGenerator.ECCLevel.Q);
                    QRCode QrCode = new QRCode(QrCodeInfo);
                    Bitmap QrBitmap = QrCode.GetGraphic(60);
                    byte[] BitmapArray = QrBitmap.BitmapToByteArray();
                    string QrUri = string.Format("data:image/png;base64,{0}", Convert.ToBase64String(BitmapArray));
                    Variables.qrCodeUri = QrUri;

                    Variables.nomContrat = _context.Contrats.Where(c => c.Id == Variables.usagerqrcodeactif.IdEnseigne).FirstOrDefault().Nom;
                    Variables.blnPossibiliteAchatPassages = (_context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().NbPassagesAchetables is not null);

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
                                    string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - interrogation PayFip depuis CarteAcces - " + monAchat.idop, "idop : " + Variables.detailPaiement.idOp + "- Objet : " + Variables.detailPaiement.objet + "- Résultat(P= paiement effectif ; A=abandon ; R=autres cas (paiement refusé)) : " + Variables.detailPaiement.resultrans + "- Date de transaction : " + Variables.detailPaiement.dattrans + "- Heure de transaction : " + Variables.detailPaiement.heurtrans + "- Numéro autorisation CB : " + Variables.detailPaiement.numauto);
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
                                string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - erreur interrogation PayFip depuis CarteAcces1 - ", ex.Message);
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                        //return RedirectToPage("./Error", new { strMessage = ex.Message });
                        string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - erreur interrogation PayFip depuis CarteAcces2 - ", ex.Message);
                    }

                    return Page();                    
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/panda/");
                    return RedirectToPage("./Error", new { strMessage = "Usager inconnu" });
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

        //public async Task<IActionResult> OnPostCarteAsync()
        //{
        //    int intErreur = 0;

        //    try
        //    {
        //        //Variables.erreurDebug = "Clic sur carte d'accès";
        //        //return Page();
        //        Variables.guidUsager = Identifiant.GuidUsager;
        //        return RedirectToPage("./CarteAcces", new { usagerGuid = Crypto.Crypte(Identifiant.GuidUsager.ToString()) });
        //    }
        //    catch (Exception ex)
        //    {
        //        return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
        //    }
        //}
    }

    //Extension method to convert Bitmap to Byte Array
    public static class BitmapExtension
    {
        public static byte[] BitmapToByteArray(this Bitmap bitmap)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                bitmap.Save(ms, ImageFormat.Png);
                return ms.ToArray();
            }
        }
    }

}
