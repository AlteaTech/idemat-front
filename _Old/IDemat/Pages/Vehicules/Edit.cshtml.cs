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

namespace IDemat.Pages.Vehicules
{
    public class EditModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;

        public EditModel(IDemat.Data.IDematContext context)
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

        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync(int? guidUsager)
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(Vehicule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VehiculeExists(Vehicule.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return RedirectToPage("../Products/Edit", new { id = guidUsager });
        }

        private bool VehiculeExists(int id)
        {
            return _context.Vehicule.Any(e => e.Id == id);
        }
    }
}
