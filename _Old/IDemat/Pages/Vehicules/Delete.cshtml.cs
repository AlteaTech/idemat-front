using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using IDemat.Data;
using IDemat.Models;

namespace IDemat.Pages.Vehicules
{
    public class DeleteModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;

        public DeleteModel(IDemat.Data.IDematContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Vehicule Vehicule { get; set; }
        public Guid GuidUsager { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id, Guid? guidUsager)
        {
            if (id == null)
            {
                return NotFound();
            }

            Vehicule = await _context.Vehicule.FirstOrDefaultAsync(m => m.Id == id);

            if (Vehicule == null)
            {
                return NotFound();
            }

            if (guidUsager == null)
            {
                GuidUsager = new Guid();
            }
            else
            {
                GuidUsager = (Guid)guidUsager;
            }
            
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id, int? guidUsager)
        {
            if (id == null)
            {
                return NotFound();
            }

            Vehicule = await _context.Vehicule.FindAsync(id);

            if (Vehicule != null)
            {
                _context.Vehicule.Remove(Vehicule);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("../Products/Edit", new { id = guidUsager });
        }
    }
}
