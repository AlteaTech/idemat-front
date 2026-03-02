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
    public class IndexModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;

        public IndexModel(IDemat.Data.IDematContext context)
        {
            _context = context;
        }

        public IList<DemandeUsager> Usagers { get;set; }

        public async Task OnGetAsync()
        {
            Usagers = null; // await _context.Usagers.Include(Usager => Usager.Vehicules).ToListAsync();            
        }
    }
}
