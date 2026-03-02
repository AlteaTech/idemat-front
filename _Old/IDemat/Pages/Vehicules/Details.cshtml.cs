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
    public class DetailsModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;

        public DetailsModel(IDemat.Data.IDematContext context)
        {
            _context = context;
        }

        public Vehicule Vehicule { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
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
            return Page();
        }
    }
}
