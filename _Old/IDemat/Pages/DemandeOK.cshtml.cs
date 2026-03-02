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
    public class DemandeOKModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public DemandeOKModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [BindProperty(SupportsGet = true)]
        public string message { get; set; }
        [BindProperty]
        public IDemat.Global.Variables Variables { get; set; }

        public void OnGet(string contratURL, string msg)
        {
            Variables = new IDemat.Global.Variables();

            Contrat contratencours = _context.Contrats.Where(c => c.URL.ToLower() == contratURL.ToLower()).FirstOrDefault();

            string strURL = _config.GetValue<string>("IDbat:URLLogos");
            if (!strURL.EndsWith("/"))
            {
                strURL += "/";
            }
            strURL += "Logo_";
            Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

            message = msg;
        }
    }
}
