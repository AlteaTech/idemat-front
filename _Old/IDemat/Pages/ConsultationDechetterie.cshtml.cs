using IDemat.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace IDemat.Pages
{
    public class ConsultationDechetterieModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public ConsultationDechetterieModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [BindProperty(SupportsGet = true)]
        public int idDechetterie { get; set; }
        [BindProperty(SupportsGet = true)]
        public Guid guidUsager { get; set; }
        [BindProperty]
        public Dechetterie MaDechetterie { get; set; }
        [BindProperty]
        public IDemat.Global.Variables Variables { get; set; }
        [BindProperty]
        public string XLabels { get; set; }
        [BindProperty]
        public string YValues { get; set; }
        [BindProperty]
        public string YColors { get; set; }
        [BindProperty]
        public string lblTitre { get; set; }
        [BindProperty]
        public string styleLundi { get; set; }
        [BindProperty]
        public string styleMardi { get; set; }
        [BindProperty]
        public string styleMercredi { get; set; }
        [BindProperty]
        public string styleJeudi { get; set; }
        [BindProperty]
        public string styleVendredi { get; set; }
        [BindProperty]
        public string styleSamedi { get; set; }
        [BindProperty]
        public string styleDimanche { get; set; }

        //private readonly ILogger<IndexModel> _logger;

        //public IndexModel(ILogger<IndexModel> logger)
        //{
        //    _logger = logger;
        //}

        public IActionResult OnGet(int guid, string usagerGuid, string jour)
        {
            Variables = new IDemat.Global.Variables();
            int intErreur = 0;

            try
            {
                idDechetterie = guid;
                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));

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

                Variables.dechetterieactive = _context.Dechetteries.Where(d => d.Id == idDechetterie).FirstOrDefault();
                if (Variables.dechetterieactive != null)
                {
                    Variables.idDechetterie = idDechetterie;

                    styleLundi = Variables.dechetterieactive.Ouverturelundi ? "idematgrispourgraphique" : "idematdesactivegrisclairpourgraphique";
                    styleMardi = Variables.dechetterieactive.Ouverturemardi ? "idematgrispourgraphique" : "idematdesactivegrisclairpourgraphique";
                    styleMercredi = Variables.dechetterieactive.Ouverturemercredi ? "idematgrispourgraphique" : "idematdesactivegrisclairpourgraphique";
                    styleJeudi = Variables.dechetterieactive.Ouverturejeudi ? "idematgrispourgraphique" : "idematdesactivegrisclairpourgraphique";
                    styleVendredi = Variables.dechetterieactive.Ouverturevendredi ? "idematgrispourgraphique" : "idematdesactivegrisclairpourgraphique";
                    styleSamedi = Variables.dechetterieactive.Ouverturesamedi ? "idematgrispourgraphique" : "idematdesactivegrisclairpourgraphique";
                    styleDimanche = Variables.dechetterieactive.Ouverturedimanche ? "idematgrispourgraphique" : "idematdesactivegrisclairpourgraphique";

                    List<string> list;
                    int maxFreq;
                    switch (jour)
                    {
                        case "LUN":
                            styleLundi = "idematgrisfoncegraspourgraphique";
                            if (_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Lundi").Count() == 0)
                            {
                                break;
                            }
                            XLabels = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Lundi").OrderBy(f => f.Heure).Select(f => f.Heure.ToString() + "H").ToArray());
                            YValues = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Lundi").OrderBy(f => f.Heure).Select(f => f.NbPassages.ToString()).ToArray());
                            list = new List<string>();
                            maxFreq = _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Lundi").OrderBy(f => f.Heure).Select(f => f.NbPassages).Max();
                            //Calcul des couleurs : rouge si > à la moitié du maximum 
                            foreach (int maFreq in _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Lundi").OrderBy(f => f.Heure).Select(f => f.NbPassages).ToArray())
                            {
                                if (maFreq > maxFreq / 2)
                                {
                                    //list.Add("rgba(255, 99, 132, 0.5)");
                                    list.Add("rgba(243, 85, 113, 0.4)");
                                }
                                else
                                {
                                    //list.Add("rgba(75, 192, 192, 0.5)");
                                    list.Add("rgba(98, 211, 150, 0.4)");                                    
                                }
                            }
                            YColors = JsonSerializer.Serialize(list.ToArray());
                            break;
                        case "MAR":
                            styleMardi = "idematgrisfoncegraspourgraphique";
                            if (_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mardi").Count() == 0)
                            {
                                break;
                            }
                            XLabels = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mardi").OrderBy(f => f.Heure).Select(f => f.Heure.ToString() + "H").ToArray());
                            YValues = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mardi").OrderBy(f => f.Heure).Select(f => f.NbPassages.ToString()).ToArray());
                            list = new List<string>();
                            maxFreq = _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mardi").OrderBy(f => f.Heure).Select(f => f.NbPassages).Max();
                            foreach (int maFreq in _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mardi").OrderBy(f => f.Heure).Select(f => f.NbPassages).ToArray())
                            {
                                if (maFreq > maxFreq / 2)
                                {
                                    list.Add("rgba(255, 99, 132, 0.5)");
                                }
                                else
                                {
                                    list.Add("rgba(75, 192, 192, 0.5)");
                                }
                            }
                            YColors = JsonSerializer.Serialize(list.ToArray());
                            break;
                        case "MER":
                            styleMercredi = "idematgrisfoncegraspourgraphique";
                            if (_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mercredi").Count() == 0)
                            {
                                break;
                            }
                            XLabels = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mercredi").OrderBy(f => f.Heure).Select(f => f.Heure.ToString() + "H").ToArray());
                            YValues = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mercredi").OrderBy(f => f.Heure).Select(f => f.NbPassages.ToString()).ToArray());
                            list = new List<string>();
                            maxFreq = _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mercredi").OrderBy(f => f.Heure).Select(f => f.NbPassages).Max();
                            foreach (int maFreq in _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Mercredi").OrderBy(f => f.Heure).Select(f => f.NbPassages).ToArray())
                            {
                                if (maFreq > maxFreq / 2)
                                {
                                    list.Add("rgba(255, 99, 132, 0.5)");
                                }
                                else
                                {
                                    list.Add("rgba(75, 192, 192, 0.5)");
                                }
                            }
                            YColors = JsonSerializer.Serialize(list.ToArray());
                            break;
                        case "JEU":
                            styleJeudi = "idematgrisfoncegraspourgraphique";
                            if (_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Jeudi").Count() == 0)
                            {
                                break;
                            }
                            XLabels = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Jeudi").OrderBy(f => f.Heure).Select(f => f.Heure.ToString() + "H").ToArray());
                            YValues = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Jeudi").OrderBy(f => f.Heure).Select(f => f.NbPassages.ToString()).ToArray());
                            list = new List<string>();
                            maxFreq = _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Jeudi").OrderBy(f => f.Heure).Select(f => f.NbPassages).Max();
                            foreach (int maFreq in _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Jeudi").OrderBy(f => f.Heure).Select(f => f.NbPassages).ToArray())
                            {
                                if (maFreq > maxFreq / 2)
                                {
                                    list.Add("rgba(255, 99, 132, 0.5)");
                                }
                                else
                                {
                                    list.Add("rgba(75, 192, 192, 0.5)");
                                }
                            }
                            YColors = JsonSerializer.Serialize(list.ToArray());
                            break;
                        case "VEN":
                            styleVendredi = "idematgrisfoncegraspourgraphique";
                            if (_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Vendredi").Count() == 0)
                            {
                                break;
                            }
                            XLabels = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Vendredi").OrderBy(f => f.Heure).Select(f => f.Heure.ToString() + "H").ToArray());
                            YValues = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Vendredi").OrderBy(f => f.Heure).Select(f => f.NbPassages.ToString()).ToArray());
                            list = new List<string>();
                            maxFreq = _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Vendredi").OrderBy(f => f.Heure).Select(f => f.NbPassages).Max();
                            foreach (int maFreq in _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Vendredi").OrderBy(f => f.Heure).Select(f => f.NbPassages).ToArray())
                            {
                                if (maFreq > maxFreq / 2)
                                {
                                    list.Add("rgba(255, 99, 132, 0.5)");
                                }
                                else
                                {
                                    list.Add("rgba(75, 192, 192, 0.5)");
                                }
                            }
                            YColors = JsonSerializer.Serialize(list.ToArray());
                            break;
                        case "SAM":
                            styleSamedi = "idematgrisfoncegraspourgraphique";
                            if (_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Samedi").Count() == 0)
                            {
                                break;
                            }
                            XLabels = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Samedi").OrderBy(f => f.Heure).Select(f => f.Heure.ToString() + "H").ToArray());
                            YValues = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Samedi").OrderBy(f => f.Heure).Select(f => f.NbPassages.ToString()).ToArray());
                            list = new List<string>();
                            maxFreq = _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Samedi").OrderBy(f => f.Heure).Select(f => f.NbPassages).Max();
                            foreach (int maFreq in _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Samedi").OrderBy(f => f.Heure).Select(f => f.NbPassages).ToArray())
                            {
                                if (maFreq > maxFreq / 2)
                                {
                                    list.Add("rgba(255, 99, 132, 0.5)");
                                }
                                else
                                {
                                    list.Add("rgba(75, 192, 192, 0.5)");
                                }
                            }
                            YColors = JsonSerializer.Serialize(list.ToArray());
                            break;
                        case "DIM":
                            styleDimanche = "idematgrisfoncegraspourgraphique";
                            if (_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Dimanche").Count() == 0)
                            {
                                break;
                            }
                            XLabels = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Dimanche").OrderBy(f => f.Heure).Select(f => f.Heure.ToString() + "H").ToArray());
                            YValues = JsonSerializer.Serialize(_context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Dimanche").OrderBy(f => f.Heure).Select(f => f.NbPassages.ToString()).ToArray());
                            list = new List<string>();
                            maxFreq = _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Dimanche").OrderBy(f => f.Heure).Select(f => f.NbPassages).Max();
                            foreach (int maFreq in _context.Frequentations.Where(f => f.IDSite == idDechetterie && f.Jour == "Dimanche").OrderBy(f => f.Heure).Select(f => f.NbPassages).ToArray())
                            {
                                if (maFreq > maxFreq / 2)
                                {
                                    list.Add("rgba(255, 99, 132, 0.5)");
                                }
                                else
                                {
                                    list.Add("rgba(75, 192, 192, 0.5)");
                                }
                            }
                            YColors = JsonSerializer.Serialize(list.ToArray());
                            break;
                        default:
                            lblTitre = "Erreur";
                            XLabels = JsonSerializer.Serialize(new string[] { "7H", "8H", "9H", "10H", "11H", "12H", "13H", "14H", "15H", "16H", "17H", "18H", "19H", "20H" });
                            break;
                    }

                    return Page();                    
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/panda/");
                    return RedirectToPage("./Error", new { strMessage = "" });
                }
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.usageractif.Nom + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }



        }        
    }    
}
