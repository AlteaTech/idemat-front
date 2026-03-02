using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using IDemat.Data;
using IDemat.Models;

namespace IDemat.Pages.Vehicules
{
    public class CreateModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;

        public CreateModel(IDemat.Data.IDematContext context)
        {
            _context = context;
        }

        public IActionResult OnGet(int? guidUsager)
        {
            if (guidUsager == null)
            {
                guidUsager = -1;
            }
            else
            {
                guidUsager = (int)guidUsager;
            }

            return Page();
        }

        [BindProperty]
        public Vehicule Vehicule { get; set; }
        public Guid guidUsager { get; set; }

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostAsync(int? guidUsager)
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            Vehicule.Product = await _context.DemandesUsagers.FindAsync(guidUsager);

            _context.Vehicule.Add(Vehicule);
            await _context.SaveChangesAsync();

            return RedirectToPage("../Products/Edit", new { id = guidUsager });
        }
    }
}
