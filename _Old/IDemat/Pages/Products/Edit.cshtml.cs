using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using IDemat.Data;
using IDemat.Models;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace IDemat.Pages.Usagers
{
    public class EditModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public EditModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [BindProperty]
        public DemandeUsager Usager { get; set; }
        public IDemat.Global.Listes Listes { get; set; }
        public IDemat.Global.Variables Variables { get; set; }
        public IFormFile UploadCI { get; set; }
        public IFormFile UploadJD { get; set; }

        public async Task<IActionResult> OnGetAsync(Guid? guid)
        {
            if (guid == null)
            {
                return NotFound();
            }

            Variables = new IDemat.Global.Variables();
            Listes = new IDemat.Global.Listes();
            //Usager = await _context.Usagers.Include(product => product.Vehicules).FirstOrDefaultAsync(m => m.Id == id);
            Usager = null;

            if (Usager == null)
            {
                return NotFound();
            }
            return Page();
        }

        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            Variables.erreurCivilite = false;
            if (!ModelState.IsValid)
            {
                //Usager.Price = Convert.ToDecimal(ModelState["Usager.Price"].AttemptedValue.Replace('.', ','));
                //ModelState["Usager.Price"].Errors.Clear();
                //ModelState.Clear();
                //if (!TryValidateModel(Product, nameof(Usager)))
                //{
                //    return Page();
                //}

                return Page();
            }
            else
            {
                if (Usager.Civilite==null)
                {
                    Variables.erreurCivilite = true;
                    return Page();
                }
            }

            //Product.Price = 12.12M;

            //if (!TryValidateModel(Usager, nameof(Usager)))
            //{
            //    return Page();
            //}

            _context.Attach(Usager).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UsagerExists(Usager.GuidUsager))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var fileCI = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CI_",  Usager.GuidUsager.ToString(), "_", UploadCI.FileName));
            using (var fileStream = new FileStream(fileCI, FileMode.Create))
            {
                await UploadCI.CopyToAsync(fileStream);
            }

            var fileJD = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("JD_", Usager.GuidUsager.ToString(), "_", UploadJD.FileName));
            using (var fileStream = new FileStream(fileJD, FileMode.Create))
            {
                await UploadJD.CopyToAsync(fileStream);
            }

            return RedirectToPage("./Index");
        }

        private bool UsagerExists(Guid guid)
        {
            return _context.DemandesUsagers.Any(e => e.GuidUsager == guid);
        }

        
    }
}
