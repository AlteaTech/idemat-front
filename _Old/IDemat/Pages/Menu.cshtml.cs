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
    public class MenuModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public MenuModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
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
            Variables = new IDemat.Global.Variables();

            try
            {
                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));

                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                if (Variables.usageractif != null)
                {
                    Variables.guidUsager = guidUsager;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + _context.Usagers.Where(u => u.GuidUsager == guidUsager).FirstOrDefault().IdEnseigne.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                    Variables.nomUsager = Variables.usageractif.Nom.Trim();
                    Variables.messageBienvenue = "Bienvenue " + (Variables.usageractif.Civilite.Trim() == "M" ? "M." : Variables.usageractif.Civilite.Trim()) + " " + Variables.usageractif.Nom.Trim();
                    Variables.blnPossibiliteAchatPassages = (_context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().NbPassagesAchetables is not null);

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
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        public async Task<IActionResult> OnPostCarteAsync()
        {
            int intErreur = 0;

            try
            {
                //Variables.erreurDebug = "Clic sur carte d'accès";
                //return Page();
                Variables.guidUsager = Identifiant.GuidUsager;
                return RedirectToPage("./CarteAcces", new { usagerGuid = Crypto.Crypte(Identifiant.GuidUsager.ToString()) });
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = intErreur.ToString() + " - " + ex.Message });
            }
        }

        public async Task<IActionResult> OnPostDechetterieAsync()
        {
            int intErreur = 0;

            try
            {
                //Variables.erreurDebug = "Clic sur déchetterie";
                //return Page();
                //return Page();
                Variables.guidUsager = Identifiant.GuidUsager;
                return RedirectToPage("./Dechetteries", new { usagerGuid = Crypto.Crypte(Identifiant.GuidUsager.ToString()) });
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = intErreur.ToString() + " - " + ex.Message });
            }
        }

        public async Task<IActionResult> OnPostInfosAsync()
        {
            int intErreur = 0;

            try
            {
                //Variables.erreurDebug = "Clic sur informations personnelles";
                //return Page();
                Variables.guidUsager = Identifiant.GuidUsager;
                return RedirectToPage("./InformationsPersonnelles", new { usagerGuid = Crypto.Crypte(Identifiant.GuidUsager.ToString()), deconnect = false}) ;
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = intErreur.ToString() + " - " + ex.Message });
            }
        }

    }
}
