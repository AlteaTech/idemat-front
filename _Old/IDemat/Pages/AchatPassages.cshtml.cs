using IDemat.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QRCoder;
using srPayFip;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace IDemat.Pages
{
    public class AchatPassagesModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public AchatPassagesModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
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

        //private readonly ILogger<IndexModel> _logger;

        //public IndexModel(ILogger<IndexModel> logger)
        //{
        //    _logger = logger;
        //}

        public IActionResult OnGet(string usagerGuid)
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
                    Variables.nbPassagesAchetables = _context.Contrats.Where(c => c.Id == Variables.idEnseigne).FirstOrDefault().NbPassagesAchetables;
                    decimal? montant = _context.Contrats.Where(c => c.Id == Variables.idEnseigne).FirstOrDefault().CoutPassageSupplementaire;
                    Variables.blnPossibiliteAchatPassages = (_context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().NbPassagesAchetables is not null);

                    CultureInfo eu = new CultureInfo("fr-FR");
                    Variables.montantAchatPassages = montant == null ? "" : ((decimal)montant * (decimal)Variables.nbPassagesAchetables).ToString("c", eu);
                    Variables.montantAchatPassagesCentimes = (int)(montant * Variables.nbPassagesAchetables * 100);
                    return Page();
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/panda/");
                    return RedirectToPage("./Error", new { strMessage = "" });
                }               
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        public async Task<IActionResult> OnPostValidationAsync(string usagerGuid)
        {
            //string testMail = "";
            try
            {                
                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));
                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                //Usager = Variables.usageractif;

                Contrat contratencours = _context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault();

                if (contratencours != null)
                {
                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                    Variables.nbPassagesAchetables = contratencours.NbPassagesAchetables;
                    decimal? montant = contratencours.CoutPassageSupplementaire;
                    Variables.montantAchatPassagesCentimes = (int)(montant * Variables.nbPassagesAchetables * 100);
                }

                //Ici intercaler l'appel à PayFip
                Console.WriteLine("1");
                
                var clientSOAP = new srPayFip.PaiementSecuriseServiceClient();

                Console.WriteLine("2");

                //testMail = Variables.usageractif.Login.Trim();
                var requestSOAP = new srPayFip.CreerPaiementSecuriseRequest
                {
                    exer = DateTime.Now.Year.ToString(),
                    mel = Variables.usageractif.Login.Trim(), //"bertrand@hermess.fr",
                    montant = Variables.montantAchatPassagesCentimes.ToString(),

                    //numcli = "006401",
                    //objet = "Achat de " + Variables.nbPassagesAchetables.ToString() + " passages supplementaires en dechetterie", //ATTENTION accents interdits
                    //refdet = "Dechetterie000001",
                    //saisie = "T",
                    //urlnotif = "https://idemat-dev.recyclage.veolia.fr/NotifPayfip",
                    //urlredirect = "https://idemat-dev.recyclage.veolia.fr/RetourPayfip"

                    numcli = contratencours.PayfipNumCli, //"006401",
                    objet = "Achat de " + Variables.nbPassagesAchetables.ToString() + " passages supplementaires en dechetterie", //ATTENTION accents interdits
                    refdet = contratencours.Trigramme + Variables.usageractif.RefClientIdbat.ToString() + "ID" + DateTime.Now.ToString("yyyyMMddHHmmssfff"),  //"Dechetterie000001",
                    saisie = contratencours.PayfipSaisie, //"T",
                    urlnotif = _config.GetValue<string>("IDbat:PayFip_urlnotif"), //"https://idemat-dev.recyclage.veolia.fr/NotifPayfip",
                    urlredirect = _config.GetValue<string>("IDbat:PayFip_urlredirect"), //"https://idemat-dev.recyclage.veolia.fr/RetourPayfip"
                };

                Console.WriteLine("3");
                
                creerPaiementSecuriseResponse1 response1SOAP = await clientSOAP.creerPaiementSecuriseAsync(requestSOAP);

                Console.WriteLine("4");
                //return RedirectToPage("./Error", new { strMessage = "4" });

                CreerPaiementSecuriseResponse responseSOAP = response1SOAP.@return;

                Console.WriteLine("5");

                Console.WriteLine(responseSOAP.ToString());
                //renvoie : srPayFip.CreerPaiementSecuriseResponse
                Console.WriteLine(responseSOAP.idOp);

                Console.WriteLine("6");

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

                Console.WriteLine("7");

                AchatPassagesPayFip achatpassagesPF = new AchatPassagesPayFip();
                achatpassagesPF.Guid = Guid.NewGuid();
                achatpassagesPF.DateAchat = DateTime.Now.ToString("yyyyMMdd");
                achatpassagesPF.DateHeureAchat = DateTime.Now;
                achatpassagesPF.refdet = requestSOAP.refdet;
                achatpassagesPF.DateHeureInterrogation = null;
                achatpassagesPF.GuidUsager = guidUsager;
                achatpassagesPF.NbPassages = (int)Variables.nbPassagesAchetables;
                achatpassagesPF.idop = responseSOAP.idOp;
                _context.AchatsPassagesPayFip.Add(achatpassagesPF);
                await _context.SaveChangesAsync();

                string URLPaiement = "https://www.tipi-client.budget.gouv.fr/tpa/paiementws.web?idop=" + responseSOAP.idOp;

                return Redirect(URLPaiement);

            //Après le paiement, si l'usager clique sur "Continuer", ça me renvoie sur https://idemat-dev.recyclage.veolia.fr/RetourPayfip?idop=e9cc332f-6316-4141-8b48-0b91420022f0 (URLRedirect)
            //Si l'usager annule, ça renvoie aussi sur redirect
            //Revoir la doc PayFip pour la suite (comment confirmer le paiement ?)
            // A partir de cette re - direction, le SI partenaire devra appeler l’offre web service PayFiP pour
            // récupérer le résultat de paiement afin d’afficher à l’usager la récapitulation de la transaction
            // ou le message d’erreur adéquate.
            // L’appel de l’url de re - direction par PayFiP est toujours accompagné de l’appel de l’url de
            // notification (voir 3.5.2.5 : soit aussitôt, soit 2 heures après si pas validé, soit dans la nuit).
            // Quand on est notifié, il faut appeler le Web Service permettant la récupération du résultat de l'opération de paiement

                //La suite devra être traitée au retour de PayFip
                //AchatPassages achatpassages = new AchatPassages();
                //achatpassages.DateAchat = DateTime.Now.ToString("yyyyMMdd");
                //achatpassages.GuidUsager = guidUsager;
                //achatpassages.NbPassages = (int)Variables.nbPassagesAchetables;
                //_context.AchatsPassages.Add(achatpassages);
                //await _context.SaveChangesAsync();

                //return RedirectToPage("./InformationsPersonnelles", new { usagerGuid = Crypto.Crypte(guidUsager.ToString()) });
            }
            catch (System.ServiceModel.FaultException<srPayFip.FonctionnelleErreur> ef)
            {

                Console.WriteLine("Depuis le catch : ");
                System.ServiceModel.FaultCode faultCode = ef.Code;
                Console.WriteLine("Code : " + faultCode.Name);
                FonctionnelleErreur faultDetail = ef.Detail;
                Console.WriteLine("Libelle : " + faultDetail.libelle);
                Console.WriteLine("Descriptif : " + faultDetail.descriptif);
                Console.WriteLine("Code2 : " + faultDetail.code);
                Console.WriteLine("Message : " + faultDetail.message);


                //Console.WriteLine("Depuis le catch : " + ex.Message + " || " + ex.InnerException.InnerException.Message);

                return RedirectToPage("./Error", new { strMessage = faultCode.Name + " - " + faultDetail.libelle + " - " + faultDetail.descriptif + " - " + faultDetail.message + " - FIN" }); ;
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message);
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }
    }    
}
