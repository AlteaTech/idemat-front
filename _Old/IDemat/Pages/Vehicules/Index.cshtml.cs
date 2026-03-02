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
    public class IndexModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;

        public IndexModel(IDemat.Data.IDematContext context)
        {
            _context = context;
        }

        public IList<Vehicule> Vehicule { get;set; }

        public async Task OnGetAsync()
        {
            Vehicule = await _context.Vehicule.ToListAsync();
        }
    }
}
