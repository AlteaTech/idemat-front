using IDemat.Data;
using IDemat.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.SqlClient;
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
    public class NotifPayfipModel : PageModel
    {
        public NotifPayfipModel()
        {
            
        }

        [BindProperty]
        public string idop { get; set; }
        //[BindProperty]
        public IDemat.Global.Variables Variables { get; set; }

        public async void OnPost()
        {
            try
            {
                string strRetMailTest = EnvoiMailSansImage("bertrand@hermess.fr", "IDemat - notification - GO", "C'est parti");
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                //return RedirectToPage("./Error", new { strMessage = ex.Message });
                string strRetMailTest = EnvoiMailSansImage("bertrand@hermess.fr", "IDemat - erreur notification PayFip part 0 - ", ex.Message);
            }

            try
            {
                string constr = "Server=OEXNAT40DV61493\\SQL1D,5100;Database=IDbat;User ID=APPidbat_extranet;Password=VP@app2009;MultipleActiveResultSets=true";
                using (SqlConnection con = new SqlConnection(constr))
                {
                    string query = "UPDATE TB_WA_ACHATPASSAGES SET STR_PAYFIP_NUMAUTO = 'Notif' WHERE LNG_GUID = '588A48DC-C248-4793-97BC-F3320914B78F'";
                    using (SqlCommand cmd = new SqlCommand(query))
                    {
                        cmd.Connection = con;
                        con.Open();
                        cmd.ExecuteNonQuery();
                        con.Close();
                    }
                }

            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                //return RedirectToPage("./Error", new { strMessage = ex.Message });
                string strRetMailTest = EnvoiMailSansImage("bertrand@hermess.fr", "IDemat - erreur notification PayFip part 1 - ", ex.Message);
            }



            try
            {
                Variables = new IDemat.Global.Variables();

                int intErreur = 0;

                Variables = new IDemat.Global.Variables();

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

                //Envoi mail test
                string strRetMailTest = EnvoiMailSansImage("bertrand@hermess.fr", "IDemat - notification PayFip - " + idop, "idop : " + Variables.detailPaiement.idOp + "- Objet : " + Variables.detailPaiement.objet + "- Résultat(P= paiement effectif ; A=abandon ; R=autres cas (paiement refusé)) : " + Variables.detailPaiement.resultrans + "- Date de transaction : " + Variables.detailPaiement.dattrans + "- Heure de transaction : " + Variables.detailPaiement.heurtrans + "- Numéro autorisation CB : " + Variables.detailPaiement.numauto);
                //return Page();

                //AchatPassagesPayFip achatpassagesPF = _context.AchatsPassagesPayFip.Where(a => a.idop == Variables.detailPaiement.idOp).FirstOrDefault();
                //if (achatpassagesPF != null)
                //{
                //    achatpassagesPF.objet = Variables.detailPaiement.objet;
                //    achatpassagesPF.resultrans = Variables.detailPaiement.resultrans;
                //    achatpassagesPF.dattrans = Variables.detailPaiement.dattrans;
                //    achatpassagesPF.heurtrans = Variables.detailPaiement.heurtrans;
                //    achatpassagesPF.numauto = Variables.detailPaiement.numauto;

                //    _context.AchatsPassagesPayFip.Update(achatpassagesPF);
                //    await _context.SaveChangesAsync();
                //}
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                //return RedirectToPage("./Error", new { strMessage = ex.Message });
                string strRetMailTest = EnvoiMailSansImage("bertrand@hermess.fr", "IDemat - erreur notification PayFip part 2 - ", ex.Message);
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
                return ex.Message;
            }
        }
    }
}
