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
    public class ModificationEmailModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public ModificationEmailModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
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
            try
            {
                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));

                Variables = new IDemat.Global.Variables();

                string strURL = _config.GetValue<string>("IDbat:URLLogos");
                if (!strURL.EndsWith("/"))
                {
                    strURL += "/";
                }
                strURL += "Logo_";
                Variables.strURLLogo = strURL + _context.Usagers.Where(u => u.GuidUsager == guidUsager).FirstOrDefault().IdEnseigne.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                Variables.nomUsager = Variables.usageractif.Nom;
                Variables.blnPossibiliteAchatPassages = (_context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().NbPassagesAchetables is not null);

                Variables.guidUsager = guidUsager;
                return Page();
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        public async Task<IActionResult> OnPostEnregistrerAsync()
        {
            bool blnErreur = false;
            int intErreur = 0;
            //if (!ModelState.IsValid)
            //{
            //    Variables.guidUsager = Identifiant.GuidUsager;

            //    return Page();
            //}

            try
            {
                Variables.erreurLogin = false;

                //throw new Exception(Identifiant.GuidUsager.ToString() + " || " + HttpContext.Request.Form["txtPwdProvisoire"] + " || " + Crypto.Crypte(HttpContext.Request.Form["txtPwdProvisoire"]));

                //Vérification existance login
                Usager usagerencours = _context.Usagers.Where(c => c.GuidUsager == Identifiant.GuidUsager).FirstOrDefault();
                if (usagerencours == null)
                {
                    Variables.guidUsager = Identifiant.GuidUsager;
                    Variables.erreurLogin = true;
                    return Page();
                }

                Variables.erreurEmail = CheckEmail(usagerencours.Login);
                if (Variables.erreurEmail != "")
                {
                    blnErreur = true;
                }

                //contrôle unicité e-mail (2 étapes : contrôle dans les usagers déjà existants, et dans les demandes encore en cours)
                Usager usagerpourrecherchemail = _context.Usagers.Where(c => c.IdEnseigne == usagerencours.IdEnseigne && c.Login == Identifiant.Login).FirstOrDefault();
                if (usagerpourrecherchemail != null)
                {
                    Variables.erreurUniciteEmail = true;
                    blnErreur = true;
                }

                DemandeUsager demandecreationpourrecherchemail = _context.DemandesUsagers.Where(c => c.IdEnseigne == usagerencours.IdEnseigne && c.Email == Identifiant.Login).FirstOrDefault();
                if (demandecreationpourrecherchemail != null)
                {
                    Variables.erreurUniciteEmail = true;
                    blnErreur = true;
                }

                if (blnErreur)
                {
                    //Variables.callingURL = callingURL;
                    Variables.guidUsager = Identifiant.GuidUsager;
                    Variables.erreurLogin = true;

                    return Page();
                }

                usagerencours.Login = Identifiant.Login;

                _context.Usagers.Update(usagerencours);
                await _context.SaveChangesAsync();

                Variables.guidUsager = Identifiant.GuidUsager;
                return RedirectToPage("./Index_svg", new { contrat = _context.Contrats.Where(c => c.Id == usagerencours.IdEnseigne).FirstOrDefault().URL });
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + intErreur.ToString() + " - " + ex.Message + "/");
                return RedirectToPage("./Error", new { strMessage = intErreur.ToString() + " - " + ex.Message });
            }
        }

        private static string CheckEmail(string p_strEMail)
        {

            if (!p_strEMail.Contains("@"))
            {
                return "L'e-mail doit contenir le caractère '@'";
            }

            if (p_strEMail.Split("@").Length - 1 > 1)
            {
                return "L'e-mail doit contenir une seule fois le caractère '@'";
            }

            if (p_strEMail.StartsWith("@"))
            {
                return "L'e-mail ne peut pas commencer par le caractère '@'";
            }

            if (p_strEMail.EndsWith("@"))
            {
                return "L'e-mail ne peut pas se terminer par le caractère '@'";
            }

            if (!p_strEMail.Contains("."))
            {
                return "L'e-mail doit contenir le caractère '.'";
            }

            if (p_strEMail.StartsWith("."))
            {
                return "L'e-mail ne peut pas commencer par le caractère '.'";
            }

            if (p_strEMail.EndsWith("."))
            {
                return "L'e-mail ne pas se terminer par le caractère '.'";
            }

            if (!p_strEMail.Substring(p_strEMail.IndexOf("@") + 1).Contains("."))
            {
                return "L'e-mail doit contenir le caractère '.' après le caractère '@'";
            }

            if (!p_strEMail.Substring(p_strEMail.IndexOf("@") + 2).Contains("."))
            {
                return "L'e-mail doit contenir le caractère '.' après le caractère '@', avec au moins un caractère intercalé";
            }

            return "";
        }
    }
}
