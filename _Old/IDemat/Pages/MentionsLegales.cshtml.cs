using IDemat.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace IDemat.Pages
{
    public class MentionsLegalesModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public MentionsLegalesModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
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

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + _context.Usagers.Where(u => u.GuidUsager == guidUsager).FirstOrDefault().IdEnseigne.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                    Variables.nomUsager = Variables.usageractif.Nom;

                    Variables.nomContrat = _context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().Nom;
                    Variables.strMentionsLegales = _context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().MentionsLegales.Replace("< ", "<");
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
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }
     
    }
}
