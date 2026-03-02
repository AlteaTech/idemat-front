using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using IDemat.Data;
using IDemat.Models;

namespace IDemat.Pages.Usagers
{
    public class DetailsModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;

        public DetailsModel(IDemat.Data.IDematContext context)
        {
            _context = context;
        }

        public DemandeUsager Usager { get; set; }

        public async Task<IActionResult> OnGetAsync(Guid? guid)
        {
            if (guid == null)
            {
                return NotFound();
            }

            Usager = await _context.DemandesUsagers.FirstOrDefaultAsync(m => m.GuidUsager == guid);

            if (Usager == null)
            {
                return NotFound();
            }
            return Page();
        }
    }
}
