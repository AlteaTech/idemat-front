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
    public class RetourPayfipModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public RetourPayfipModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;

            //Variables = new IDemat.Global.Variables();
            //Variables.detailPaiement = new RecupererDetailPaiementSecuriseResponse();

            //Envoi mail test
            //string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - retour PayFip - " + idop, "Depuis constructeur");
        }

        [BindProperty]
        public Guid guidUsager { get; set; }
        [BindProperty]
        public Usager Identifiant { get; set; }
        [BindProperty]
        public string idop { get; set; }
        [BindProperty]
        public IDemat.Global.Variables Variables { get; set; }

        public async Task<IActionResult> OnPost()
        {
            Variables = new IDemat.Global.Variables();

            try
            {
                //return Page();
                bool blnErreur = false;
                int intErreur = 0;

                try
                {
                    Variables = new IDemat.Global.Variables();

                    AchatPassagesPayFip monAchat = _context.AchatsPassagesPayFip.Where(a => a.idop == idop).FirstOrDefault();
                    if (monAchat != null)
                    {
                        guidUsager = monAchat.GuidUsager;

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
                            Variables.blnPossibiliteAchatPassages = (_context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().NbPassagesAchetables is not null);

                            Variables.nomUsager = Variables.usageractif.Nom;

                            ViewData["guidUsager"] = guidUsager;
                            ViewData["Logo"] = Variables.strURLLogo;
                        }
                        else
                        {
                            //return Redirect("https://pixabay.com/fr/images/search/panda/");
                            return RedirectToPage("./Error", new { strMessage = "" });
                        }
                    }
                    else
                    {
                        //return Redirect("https://pixabay.com/fr/images/search/panda/");
                        return RedirectToPage("./Error", new { strMessage = "Pas d'achat PayFip trouvé avec l'idop " + idop });
                    }

                    var requestbisSOAP = new srPayFip.RecupererDetailPaiementSecuriseRequest
                    {
                        idOp = idop
                    };

                    Console.WriteLine("8");

                    var clientSOAP = new srPayFip.PaiementSecuriseServiceClient();

                    Console.WriteLine("9");

                    recupererDetailPaiementSecuriseResponse1 response1bisSOAP = await clientSOAP.recupererDetailPaiementSecuriseAsync(requestbisSOAP);

                    Console.WriteLine("10");

                    RecupererDetailPaiementSecuriseResponse responsebisSOAP = response1bisSOAP.@return;

                    Console.WriteLine("11");

                    Variables.detailPaiement = responsebisSOAP;

                    Console.WriteLine(responsebisSOAP.ToString());
                    //renvoie : srPayFip.CreerPaiementSecuriseResponse
                    Console.WriteLine(responsebisSOAP.idOp);
                    Console.WriteLine(responsebisSOAP.objet);
                    Console.WriteLine(responsebisSOAP.resultrans);
                    Console.WriteLine(responsebisSOAP.dattrans);
                    Console.WriteLine(responsebisSOAP.heurtrans);
                    Console.WriteLine(responsebisSOAP.numauto);

                    Console.WriteLine("12");

                    //if (response.IsCompletedSuccessfully)
                    //{
                    //    Console.WriteLine("YES !!! ");
                    //}
                    //else
                    //{
                    //    Console.WriteLine("Fallait pas rêver");
                    //    Console.WriteLine(response.ToString());
                    //}

                    clientSOAP.Close();

                    AchatPassagesPayFip achatpassagesPF = _context.AchatsPassagesPayFip.Where(a => a.idop == Variables.detailPaiement.idOp).FirstOrDefault();
                    if (achatpassagesPF == null)
                    {
                        return Page();
                    }

                    achatpassagesPF.objet = Variables.detailPaiement.objet;
                    achatpassagesPF.resultrans = Variables.detailPaiement.resultrans;
                    achatpassagesPF.dattrans = Variables.detailPaiement.dattrans;
                    achatpassagesPF.heurtrans = Variables.detailPaiement.heurtrans;
                    achatpassagesPF.numauto = Variables.detailPaiement.numauto;
                    achatpassagesPF.DateHeureInterrogation = DateTime.Now;

                    _context.AchatsPassagesPayFip.Update(achatpassagesPF);
                    await _context.SaveChangesAsync();

                    if (achatpassagesPF.resultrans == "P")
                    {
                        Variables.texteRetourPayfip = "<br />Votre opération a bien été prise en compte, votre compte sera crédité sous réserve de réussite de la transaction.";
                    }
                    else
                    {
                        Variables.texteRetourPayfip = "<br />Nous vous informons qu'après avoir saisi vos informations bancaires, vous avez annulé la transaction. Aucun débit n'a été effectué sur votre compte.<br /><br />Si vous souhaitez finaliser votre achat, nous vous invitons à recommencer le parcours de commande et à valider le paiement pour que la transaction soit complétée.";
                    }
                    
                    //Envoi mail test
                    string strRetMailTest = EnvoiMail("bertrand@hermess.fr", "IDemat - retour PayFip - " + idop, "idop : " + Variables.detailPaiement.idOp + "- Objet : " + Variables.detailPaiement.objet + "- Résultat(P= paiement effectif ; A=abandon ; R=autres cas (paiement refusé)) : " + Variables.detailPaiement.resultrans + "- Date de transaction : " + Variables.detailPaiement.dattrans + "- Heure de transaction : " + Variables.detailPaiement.heurtrans + "- Numéro autorisation CB : " + Variables.detailPaiement.numauto);

                    return Page();
                }
                catch (System.ServiceModel.FaultException<srPayFip.FonctionnelleErreur> ex)
                {

                    Console.WriteLine("Depuis le catch : ");
                    System.ServiceModel.FaultCode faultCode = ex.Code;
                    Console.WriteLine("Code : " + faultCode.Name);
                    FonctionnelleErreur faultDetail = ex.Detail;
                    Console.WriteLine("Libelle : " + faultDetail.libelle);
                    Console.WriteLine("Descriptif : " + faultDetail.descriptif);
                    Console.WriteLine("Code2 : " + faultDetail.code);
                    Console.WriteLine("Message : " + faultDetail.message);


                    //Console.WriteLine("Depuis le catch : " + ex.Message + " || " + ex.InnerException.InnerException.Message);

                    return Page();
                }
                catch (Exception ex)
                {
                    //return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
                    return RedirectToPage("./Error", new { strMessage = intErreur.ToString() + " - " + ex.Message });
                }

            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        public async Task<IActionResult> OnPostFermerAsync()
        {
            bool blnErreur = false;
            int intErreur = 0;

            try
            {
                var requestbisSOAP = new srPayFip.RecupererDetailPaiementSecuriseRequest
                {
                    idOp = idop
                };

                Console.WriteLine("8");

                var clientSOAP = new srPayFip.PaiementSecuriseServiceClient();

                Console.WriteLine("9");

                recupererDetailPaiementSecuriseResponse1 response1bisSOAP = await clientSOAP.recupererDetailPaiementSecuriseAsync(requestbisSOAP);

                Console.WriteLine("10");

                RecupererDetailPaiementSecuriseResponse responsebisSOAP = response1bisSOAP.@return;

                Console.WriteLine("11");

                Variables = new IDemat.Global.Variables();
                Variables.detailPaiement = responsebisSOAP;

                Console.WriteLine(responsebisSOAP.ToString());
                //renvoie : srPayFip.CreerPaiementSecuriseResponse
                Console.WriteLine(responsebisSOAP.idOp);
                Console.WriteLine(responsebisSOAP.objet);
                Console.WriteLine(responsebisSOAP.resultrans);
                Console.WriteLine(responsebisSOAP.dattrans);
                Console.WriteLine(responsebisSOAP.heurtrans);
                Console.WriteLine(responsebisSOAP.numauto);

                Console.WriteLine("12");

                //if (response.IsCompletedSuccessfully)
                //{
                //    Console.WriteLine("YES !!! ");
                //}
                //else
                //{
                //    Console.WriteLine("Fallait pas rêver");
                //    Console.WriteLine(response.ToString());
                //}

                clientSOAP.Close();

                return Page();
            }
            catch (System.ServiceModel.FaultException<srPayFip.FonctionnelleErreur> ex)
            {

                Console.WriteLine("Depuis le catch : ");
                System.ServiceModel.FaultCode faultCode = ex.Code;
                Console.WriteLine("Code : " + faultCode.Name);
                FonctionnelleErreur faultDetail = ex.Detail;
                Console.WriteLine("Libelle : " + faultDetail.libelle);
                Console.WriteLine("Descriptif : " + faultDetail.descriptif);
                Console.WriteLine("Code2 : " + faultDetail.code);
                Console.WriteLine("Message : " + faultDetail.message);


                //Console.WriteLine("Depuis le catch : " + ex.Message + " || " + ex.InnerException.InnerException.Message);

                return Page();
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = intErreur.ToString() + " - " + ex.Message });
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
