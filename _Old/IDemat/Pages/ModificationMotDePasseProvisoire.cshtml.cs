using IDemat.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IDemat.Pages
{
    public class ModificationMotDePasseProvisoireModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public ModificationMotDePasseProvisoireModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
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

        //private readonly ILogger<IndexModel> _logger;

        //public IndexModel(ILogger<IndexModel> logger)
        //{
        //    _logger = logger;
        //}

        public IActionResult OnGet(string usagerGuid)
        {
            guidUsager = new Guid(Crypto.Decrypte(usagerGuid));

            Variables = new IDemat.Global.Variables();

            //try
            //{
            //    Contrat contratencours = _context.Contrats.Where(c => c.URL.ToLower() == contrat.ToLower()).FirstOrDefault();

            //    if (contratencours != null)
            //    {
            //        Variables.idEnseigne = contratencours.Id;
            //        Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
            //        Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
            //        Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
            //        Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
            //        Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
            //    }
            //    else
            //    {
            //        return Redirect("https://pixabay.com/fr/images/search/panda/");
            //    }
            //}
            //catch (Exception ex)
            //{
            //    return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + "/");
            //}

            Variables.guidUsager = guidUsager;

            Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
            if (Variables.usageractif != null)
            {
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

                return Page();
            }
            else
            {
                //return Redirect("https://pixabay.com/fr/images/search/panda/");
                return RedirectToPage("./Error", new { strMessage = "" });
            }
        }

        public async Task<IActionResult> OnPostTerminerAsync()
        {
            int intErreur = 0;
            //if (!ModelState.IsValid)
            //{
            //    Variables.guidUsager = Identifiant.GuidUsager;

            //    return Page();
            //}

            try
            {                
                Variables.erreurLogin = false;
                Variables.erreurMotdepasse = false;
                Variables.erreurMotdepasseComplexite = false;
                Variables.erreurMotdepasseConfirmation = false;

                //throw new Exception(Identifiant.GuidUsager.ToString() + " || " + HttpContext.Request.Form["txtPwdActuel"] + " || " + Crypto.Crypte(HttpContext.Request.Form["txtPwdActuel"]));

                Usager usagerencours = _context.Usagers.Where(c => c.GuidUsager == Identifiant.GuidUsager && c.Motdepasse == Crypto.Crypte(HttpContext.Request.Form["txtPwdActuel"])).FirstOrDefault();
                if (usagerencours == null)
                {
                    Variables.guidUsager = Identifiant.GuidUsager;
                    Variables.erreurMotdepasse = true;
                    return Page();
                }

                if (HttpContext.Request.Form["txtPwd"].ToString().Length < 8 || HttpContext.Request.Form["txtPwd"].ToString().Length > 15 || !VerifCaractere(HttpContext.Request.Form["txtPwd"].ToString()) )
                {
                    Variables.guidUsager = Identifiant.GuidUsager;
                    Variables.erreurMotdepasseComplexite = true;
                    return Page();
                }

                if ( HttpContext.Request.Form["txtPwd"] != HttpContext.Request.Form["txtPwdConfirmation"] )
                {
                    Variables.guidUsager = Identifiant.GuidUsager;
                    Variables.erreurMotdepasseConfirmation = true;
                    return Page();
                }

                usagerencours.Motdepasse = Crypto.Crypte(HttpContext.Request.Form["txtPwd"]);
                usagerencours.MotdepasseChange = true;

                _context.Usagers.Update(usagerencours);
                await _context.SaveChangesAsync();

                Variables.guidUsager = Identifiant.GuidUsager;
                return RedirectToPage("./Index_svg", new { contrat = _context.Contrats.Where(c => c.Id == usagerencours.IdEnseigne).FirstOrDefault().URL });
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = intErreur.ToString() + " - " + ex.Message + " - " + ex.InnerException.Message });
            }
        }

        private bool VerifCaractere(string chaine)
        {
            string possibleCharsMAJ = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
            string possibleCharsMin = "abcdefghijkmnopqrstuvwxyz";
            string possibleCharsChiffre = "123456789";
            string possibleCharsSpecial = "!@#$%^&*";

            bool blnMAJ = false;
            bool blnMin = false;
            bool blnChiffre = false;
            bool blnSpecial = false;

            foreach (char cCar in possibleCharsMAJ)
            {
                if (chaine.Contains(cCar))
                {
                    blnMAJ = true;
                    break;
                }
            }

            foreach (char cCar in possibleCharsMin)
            {
                if (chaine.Contains(cCar))
                {
                    blnMin = true;
                    break;
                }
            }

            foreach (char cCar in possibleCharsChiffre)
            {
                if (chaine.Contains(cCar))
                {
                    blnChiffre = true;
                    break;
                }
            }

            foreach (char cCar in possibleCharsSpecial)
            {
                if (chaine.Contains(cCar))
                {
                    blnSpecial = true;
                    break;
                }
            }

            return blnMAJ && blnMin && blnChiffre && blnSpecial;
        }


    }
}
