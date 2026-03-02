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
using System.Net;
using System.Net.Mail;
using System.ComponentModel;
using System.Diagnostics;
using System.ComponentModel.DataAnnotations;

namespace IDemat.Pages.Usagers
{
    public class CreateModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public CreateModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [BindProperty(SupportsGet = true)]
        public string contrat { get; set; }
        [BindProperty]
        public DemandeUsager Usager { get; set; }
        [BindProperty]
        public IDemat.Global.Variables Variables { get; set; }
        [BindProperty]
        public IDemat.Global.Listes Listes { get; set; }
        [BindProperty]
        public List<SelectListItem> Communes { get; set; }
        [BindProperty]
        public List<SelectListItem> ZoneJ1CG { get; set; }
        [BindProperty]
        public IFormFile UploadCI { get; set; }
        [BindProperty]
        public IFormFile UploadJD { get; set; }
        [BindProperty]
        public IFormFile UploadKB { get; set; }
        [BindProperty]
        public IFormFile UploadCG { get; set; }
        [BindProperty]
        public bool blnMentionsLegales { get; set; }
        [BindProperty]
        public string strChoixPartOuPro { get; set; }

        public IActionResult OnGet()
        {

            Variables = new IDemat.Global.Variables();
            Listes = new IDemat.Global.Listes();
            Variables.guidCreation = Guid.NewGuid();

            try
            {
                Contrat contratencours = _context.Contrats.Where(c => c.URL.ToLower() == contrat.ToLower()).FirstOrDefault();

                if (contratencours != null)
                {
                    Communes = _context.RefsCommunes.Where(c => c.IdEnseigne == contratencours.Id).Select(cv => new SelectListItem
                    {
                        Value = cv.CPVille,
                        Text = cv.CPVille
                    })
                    .ToList();

                    ZoneJ1CG = new List<SelectListItem>();
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTL",
                        Text = "MTL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT1",
                        Text = "MTT1"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT2",
                        Text = "MTT2"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TM",
                        Text = "TM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "QM",
                        Text = "QM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CYCL",
                        Text = "CYCL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CL",
                        Text = "CL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "VP",
                        Text = "VP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TCP",
                        Text = "TCP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CTTE",
                        Text = "CTTE"
                    });

                    Variables.idEnseigne = contratencours.Id;
                    Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
                    Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;
                    Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.strMentionsLegales = contratencours.MentionsLegales.Replace("< ", "<");
                    //Variables.strMentionsLegales = contratencours.MentionsLegales + "< a href='https://idbat-dev.recyclage.veolia.fr' target='_blank'>Cliquez ici< /a>".Replace("< ","<").Replace("'","\"") ;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/chat/");
                    return RedirectToPage("../Error", new { strMessage = "1" });
                }
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/chat/");
                return RedirectToPage("../Error", new { strMessage = "2 - " + ex.Message });
            }

            //Variables.strImmatriculations = "Ajouter un véhicule :";
            Variables.strImmatriculations = "";


            return Page();
        }

        public async Task<IActionResult> OnPostAjoutImmatAsync(int idEnseigne, string strImmatriculations, string guidCreation)
        {
            try
            {
                bool blnErreur = false;

                //Variables.erreurCG = false;

                //Variables = new IDemat.Global.Variables();
                //Variables.callingURL = callingURL;
                Variables.idEnseigne = idEnseigne;
                Variables.strImmatriculations = strImmatriculations ?? "";
                Variables.guidCreation = new Guid(guidCreation);
                Variables.strPartOuPro = strChoixPartOuPro;

                Contrat contratencours = _context.Contrats.Where(c => c.Id == idEnseigne).FirstOrDefault();
                if (contratencours != null)
                {
                    Communes = _context.RefsCommunes.Where(c => c.IdEnseigne == contratencours.Id).Select(cv => new SelectListItem
                    {
                        Value = cv.CPVille,
                        Text = cv.CPVille
                    })
                        .ToList();

                    ZoneJ1CG = new List<SelectListItem>();
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTL",
                        Text = "MTL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT1",
                        Text = "MTT1"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT2",
                        Text = "MTT2"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TM",
                        Text = "TM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "QM",
                        Text = "QM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CYCL",
                        Text = "CYCL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CL",
                        Text = "CL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "VP",
                        Text = "VP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TCP",
                        Text = "TCP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CTTE",
                        Text = "CTTE"
                    });

                    Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
                    Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;
                    Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.strMentionsLegales = contratencours.MentionsLegales.Replace("< ", "<");
                }

                if (Usager.ImmatEnCours == null)
                {
                    Variables.erreurImmat = true;
                    blnErreur = true;
                }
                else
                {
                    if (Usager.ImmatEnCours.Trim() == "")
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                }
                if (contratencours.DemandeZoneJ1F3)
                {
                    if (Usager.ImmatJ1EnCours == null)
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                    else
                    {
                        if (Usager.ImmatJ1EnCours.Trim() == "")
                        {
                            Variables.erreurImmat = true;
                            blnErreur = true;
                        }
                    }
                    if (Usager.ImmatF3EnCours == null)
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                    else
                    {
                        if (Usager.ImmatF3EnCours.Trim() == "")
                        {
                            Variables.erreurImmat = true;
                            blnErreur = true;
                        }
                        else
                        {
                            if (! int.TryParse(Usager.ImmatF3EnCours, out int result))
                            {
                                Variables.erreurF3 = true;
                                blnErreur = true;
                            }
                        }
                    }
                }
                if (UploadCG == null)
                {
                    Variables.erreurCG = true;
                    blnErreur = true;
                }

                if (!blnErreur)
                {
                    if (strImmatriculations == null || strImmatriculations == "" || strImmatriculations == "Ajouter un véhicule :")
                    {
                        //Variables.strImmatriculations = DateTime.Now.ToShortTimeString();
                        Variables.strImmatriculations = Usager.ImmatEnCours;
                        if (contratencours.DemandeZoneJ1F3)
                        {
                            Variables.strImmatriculations += " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                        }
                    }
                    else
                    {
                        //Variables.strImmatriculations += ";" + DateTime.Now.ToShortTimeString();
                        Variables.strImmatriculations += ";" + Usager.ImmatEnCours;
                        if (contratencours.DemandeZoneJ1F3)
                        {
                            Variables.strImmatriculations += " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                        }
                    }

                    try
                    {
                        var fileCG = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CG_", guidCreation, "_", Usager.ImmatEnCours, "_", UploadCG.FileName));
                        using (var fileStream = new FileStream(fileCG, FileMode.Create))
                        {
                            await UploadCG.CopyToAsync(fileStream);
                        }
                    }
                    catch (Exception ex)
                    {
                        Variables.erreurDebug = ex.Message;
                        return Page();
                    }
                    Usager.ImmatEnCours = "";
                    Usager.ImmatJ1EnCours = "";
                    Usager.ImmatF3EnCours = "";
                }

                string strURL = _config.GetValue<string>("IDbat:URLLogos");
                if (!strURL.EndsWith("/"))
                {
                    strURL += "/";
                }
                strURL += "Logo_";
                Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                return Page();
            }
            catch (Exception ex)
            {
                //    //return Redirect("https://pixabay.com/fr/images/search/chat/");
                return RedirectToPage("../Error", new { strMessage = "Immat - " + ex.Message });
            }
        }

        public async Task<IActionResult> OnPostAjoutImmatProAsync(int idEnseigne, string strImmatriculations, string guidCreation)
        {
            try
            {
                bool blnErreur = false;

                //Variables.erreurCG = false;

                //Variables = new IDemat.Global.Variables();
                //Variables.callingURL = callingURL;
                Variables.idEnseigne = idEnseigne;
                Variables.strImmatriculations = strImmatriculations ?? "";
                Variables.guidCreation = new Guid(guidCreation);
                Variables.strPartOuPro = strChoixPartOuPro;

                Contrat contratencours = _context.Contrats.Where(c => c.Id == idEnseigne).FirstOrDefault();
                if (contratencours != null)
                {
                    Communes = _context.RefsCommunes.Where(c => c.IdEnseigne == contratencours.Id).Select(cv => new SelectListItem
                    {
                        Value = cv.CPVille,
                        Text = cv.CPVille
                    })
                        .ToList();

                    ZoneJ1CG = new List<SelectListItem>();
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTL",
                        Text = "MTL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT1",
                        Text = "MTT1"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT2",
                        Text = "MTT2"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TM",
                        Text = "TM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "QM",
                        Text = "QM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CYCL",
                        Text = "CYCL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CL",
                        Text = "CL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "VP",
                        Text = "VP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TCP",
                        Text = "TCP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CTTE",
                        Text = "CTTE"
                    });

                    Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
                    Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;
                    Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.strMentionsLegales = contratencours.MentionsLegales.Replace("< ", "<");
                }

                if (Usager.ImmatEnCours == null)
                {
                    Variables.erreurImmat = true;
                    blnErreur = true;
                }
                else
                {
                    if (Usager.ImmatEnCours.Trim() == "")
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                }
                if (contratencours.DemandeZoneJ1F3)
                {
                    if (Usager.ImmatJ1EnCours == null)
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                    else
                    {
                        if (Usager.ImmatJ1EnCours.Trim() == "")
                        {
                            Variables.erreurImmat = true;
                            blnErreur = true;
                        }
                    }
                    if (Usager.ImmatF3EnCours == null)
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                    else
                    {
                        if (Usager.ImmatF3EnCours.Trim() == "")
                        {
                            Variables.erreurImmat = true;
                            blnErreur = true;
                        }
                        else
                        {
                            if (!int.TryParse(Usager.ImmatF3EnCours, out int result))
                            {
                                Variables.erreurF3 = true;
                                blnErreur = true;
                            }
                        }
                    }
                }
                if (UploadCG == null)
                {
                    Variables.erreurCG = true;
                    blnErreur = true;
                }

                if (!blnErreur)
                {
                    if (strImmatriculations == null || strImmatriculations == "" || strImmatriculations == "Ajouter un véhicule :")
                    {
                        //Variables.strImmatriculations = DateTime.Now.ToShortTimeString();
                        Variables.strImmatriculations = Usager.ImmatEnCours;
                        if (contratencours.DemandeZoneJ1F3)
                        {
                            Variables.strImmatriculations += " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                        }
                    }
                    else
                    {
                        //Variables.strImmatriculations += ";" + DateTime.Now.ToShortTimeString();
                        Variables.strImmatriculations += ";" + Usager.ImmatEnCours;
                        if (contratencours.DemandeZoneJ1F3)
                        {
                            Variables.strImmatriculations += " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                        }
                    }

                    try
                    {
                        var fileCG = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CG_", guidCreation, "_", Usager.ImmatEnCours, "_", UploadCG.FileName));
                        using (var fileStream = new FileStream(fileCG, FileMode.Create))
                        {
                            await UploadCG.CopyToAsync(fileStream);
                        }
                    }
                    catch (Exception ex)
                    {
                        Variables.erreurDebug = ex.Message;
                        return Page();
                    }
                    Usager.ImmatEnCours = "";
                    Usager.ImmatJ1EnCours = "";
                    Usager.ImmatF3EnCours = "";
                }

                string strURL = _config.GetValue<string>("IDbat:URLLogos");
                if (!strURL.EndsWith("/"))
                {
                    strURL += "/";
                }
                strURL += "Logo_";
                Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();

                return Page();
            }
            catch (Exception ex)
            {
                //    //return Redirect("https://pixabay.com/fr/images/search/chat/");
                return RedirectToPage("../Error", new { strMessage = "Immat - " + ex.Message });
            }
        }

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostEnregistrerAsync()
        {
            try
            {
                Variables.erreurCivilite = false;
                Variables.erreurNom = false;
                Variables.erreurPrenom = false;
                Variables.erreurSociete = false;
                Variables.erreurSIRET = false;
                Variables.erreurAdresse = false;
                //Variables.erreurCodePostal = false;
                Variables.erreurVille = false;
                Variables.erreurMail = false;
                Variables.erreurTelephone = false;
                Variables.erreurTypeCarte = false;
                Variables.erreurMentionsLegales = false;
                Variables.erreurCI = false;
                Variables.erreurJD = false;
                Variables.erreurEmail = "";
                bool blnErreur = false;

                if (!ModelState.IsValid)
                {
                    //Usager.Price = Convert.ToDecimal(ModelState["Usager.Price"].AttemptedValue.Replace('.', ','));
                    //ModelState["Usager.Price"].Errors.Clear();
                    //ModelState.Clear();
                    //if (!TryValidateModel(Usager, nameof(Usager)))
                    //{
                    //    return Page();
                    //}
                    Variables.idEnseigne = Usager.IdEnseigne;
                    Variables.strImmatriculations = Usager.strImmatriculations ?? "";
                    if (Variables.strImmatriculations == "Ajouter un véhicule :") { Variables.strImmatriculations = ""; }
                    Variables.guidCreation = Usager.GuidUsager;
                    Variables.strPartOuPro = strChoixPartOuPro;

                    Communes = _context.RefsCommunes.Where(c => c.IdEnseigne == Usager.IdEnseigne).Select(cv => new SelectListItem
                    {
                        Value = cv.CPVille,
                        Text = cv.CPVille
                    })
                    .ToList();

                    return Page();
                }

                //Usager.GuidUsager = Variables.guidCreation;

                if (blnMentionsLegales == false)
                {
                    Variables.erreurMentionsLegales = true;
                    blnErreur = true;
                }

                if (Usager.Civilite == null)
                {
                    Variables.erreurCivilite = true;
                    blnErreur = true;
                }

                if (Usager.Nom == null)
                {
                    Variables.erreurNom = true;
                    blnErreur = true;
                }

                if (Usager.Prenom == null)
                {
                    Variables.erreurPrenom = true;
                    blnErreur = true;
                }

                if (Usager.Adresse == null)
                {
                    Variables.erreurAdresse = true;
                    blnErreur = true;
                }

                //if (Usager.CP == null)
                //{
                //    Variables.erreurCodePostal = true;
                //    blnErreur = true;
                //}

                if (Usager.CPVille == null || Usager.CPVille == "")
                {
                    Variables.erreurVille = true;
                    blnErreur = true;
                }

                if (Usager.Email == null)
                {
                    Variables.erreurMail = true;
                    blnErreur = true;
                }
                else
                {
                    Variables.erreurEmail = CheckEmail(Usager.Email);
                    if (Variables.erreurEmail != "")
                    {
                        blnErreur = true;
                    }

                    //contrôle unicité e-mail (2 étapes : contrôle dans les usagers déjà existants, et dans les demandes encore en cours)
                    Usager usagerpourrecherchemail = _context.Usagers.Where(c => c.IdEnseigne == Usager.IdEnseigne && c.Login == Usager.Email).FirstOrDefault();
                    if (usagerpourrecherchemail != null)
                    {
                        Variables.erreurUniciteEmail = true;
                        blnErreur = true;
                    }

                    DemandeUsager demandecreationpourrecherchemail = _context.DemandesUsagers.Where(c => c.IdEnseigne == Usager.IdEnseigne && c.Email == Usager.Email).FirstOrDefault();
                    if (demandecreationpourrecherchemail != null)
                    {
                        Variables.erreurUniciteEmail = true;
                        blnErreur = true;
                    }
                }

                if (Usager.Telephone == null)
                {
                    Variables.erreurTelephone = true;
                    blnErreur = true;
                }

                Contrat contratencours = _context.Contrats.Where(c => c.Id == Usager.IdEnseigne).FirstOrDefault();
                if (contratencours != null)
                {
                    Communes = _context.RefsCommunes.Where(c => c.IdEnseigne == contratencours.Id).Select(cv => new SelectListItem
                    {
                        Value = cv.CPVille,
                        Text = cv.CPVille
                    })
                    .ToList();

                    ZoneJ1CG = new List<SelectListItem>();
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTL",
                        Text = "MTL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT1",
                        Text = "MTT1"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT2",
                        Text = "MTT2"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TM",
                        Text = "TM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "QM",
                        Text = "QM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CYCL",
                        Text = "CYCL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CL",
                        Text = "CL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "VP",
                        Text = "VP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TCP",
                        Text = "TCP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CTTE",
                        Text = "CTTE"
                    });

                    Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
                    Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;
                    Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.strMentionsLegales = contratencours.MentionsLegales.Replace("< ", "<");

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                }
                if (Variables.blnCarteDemat && !Variables.blnCartePhysique) { Usager.TypeCarte = "Carte dématérialisée"; }
                if (Variables.blnCartePhysique && !Variables.blnCarteDemat) { Usager.TypeCarte = "Carte physique"; }
                if (Variables.blnCarteDemat && Variables.blnCartePhysique)
                {
                    if (Usager.TypeCarte == null)
                    {
                        Variables.erreurTypeCarte = true;
                        blnErreur = true;
                    }
                }
                if (contratencours.DemandeZoneJ1F3)
                {
                    if ((Usager.ImmatEnCours ?? "") != "" && ((Usager.ImmatJ1EnCours ?? "") == "" || (Usager.ImmatF3EnCours ?? "") == ""))
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                }
                if (Usager.ImmatF3EnCours != null)
                {
                    if (Usager.ImmatF3EnCours.Trim() != "")
                    {
                        if (!int.TryParse(Usager.ImmatF3EnCours, out int result))
                        {
                            Variables.erreurF3 = true;
                            blnErreur = true;
                        }
                    }
                }
                if ((Usager.ImmatEnCours ?? "") != "" && UploadCG == null)
                {
                    Variables.erreurCG = true;
                    blnErreur = true;
                }
                if (UploadCI == null)
                {
                    Variables.erreurCI = true;
                    blnErreur = true;
                }
                if (UploadJD == null)
                {
                    Variables.erreurJD = true;
                    blnErreur = true;
                }
                if (blnErreur)
                {
                    //Variables.callingURL = callingURL;
                    Variables.idEnseigne = Usager.IdEnseigne;
                    Variables.strImmatriculations = Usager.strImmatriculations ?? "";
                    Variables.guidCreation = Usager.GuidUsager;
                    Variables.strPartOuPro = strChoixPartOuPro;

                    return Page();
                }

                if (Usager.strImmatriculations == null || Usager.strImmatriculations == "" || Usager.strImmatriculations == "Ajouter un véhicule :")
                {
                    Usager.strImmatriculations = Usager.ImmatEnCours + " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                }
                else
                {
                    Usager.strImmatriculations += ";" + Usager.ImmatEnCours + " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                }

                Usager.NomPrenom = Usager.Nom.Trim() + " " + Usager.Prenom.Trim();
                Usager.CP = Usager.CPVille.Substring(0, 5);
                Usager.Ville = Usager.CPVille.Substring(6);

                _context.DemandesUsagers.Add(Usager);
                await _context.SaveChangesAsync();

                try
                {
                    var fileCI = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CI_", Usager.GuidUsager.ToString(), "_", UploadCI.FileName));
                    using (var fileStream = new FileStream(fileCI, FileMode.Create))
                    {
                        await UploadCI.CopyToAsync(fileStream);
                    }

                    var fileJD = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("JD_", Usager.GuidUsager.ToString(), "_", UploadJD.FileName));
                    using (var fileStream = new FileStream(fileJD, FileMode.Create))
                    {
                        await UploadJD.CopyToAsync(fileStream);
                    }

                    if ((Usager.ImmatEnCours ?? "") != "")
                    {
                        //var fileCG = Path.Combine(_environment.ContentRootPath, "uploads", string.Concat("CG_", Usager.GuidUsager.ToString(), "_", Usager.ImmatEnCours, "_", UploadCG.FileName));
                        //Au-dessus envoi dans le répertoire de l'application, en-dessous essai d'envoi dans un répertoire autre (le même que le MC)
                        var fileCG = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CG_", Usager.GuidUsager.ToString(), "_", Usager.ImmatEnCours, "_", UploadCG.FileName));
                        using (var fileStream = new FileStream(fileCG, FileMode.Create))
                        {
                            await UploadCG.CopyToAsync(fileStream);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Variables.erreurDebug = ex.Message;
                    Variables.idEnseigne = Usager.IdEnseigne;
                    Variables.strImmatriculations = Usager.strImmatriculations ?? "";
                    Variables.guidCreation = Usager.GuidUsager;
                    Variables.strPartOuPro = strChoixPartOuPro;

                    return Page();
                }

                //Envoi mail demandeur
                //bool blnRetMail = EnvoiMail("bertrand@hermess.fr;" + Usager.Email, "IDemat - Merci de votre confiance", "<body>Bonjour<br/>ça semble fonctionner :-)</body>");
                string strRetMail = EnvoiMail(Usager.Email, "IDemat - Merci de votre confiance", "<html dir='ltr' lang='en' class=''><charset='utf-8'><style type='text/css'>#messagebody div.rcmBody .ExternalClass {width: 100%}#messagebody div.rcmBody .ExternalClass, #messagebody div.rcmBody .ExternalClass p, #messagebody div.rcmBody .ExternalClass span, #messagebody div.rcmBody .ExternalClass font, #messagebody div.rcmBody .ExternalClass td, #messagebody div.rcmBody .ExternalClass div {line-height: 100%}#messagebody div.rcmBody {-webkit-text-size-adjust: none;-ms-text-size-adjust: none}#messagebody div.rcmBody {margin: 0;padding: 0}#messagebody div.rcmBody table td {border-collapse: collapse}#messagebody div.rcmBody p {margin: 0;padding: 0;margin-bottom: 0}#messagebody div.rcmBody h1, #messagebody div.rcmBody h2, #messagebody div.rcmBody h3, #messagebody div.rcmBody h4, #messagebody div.rcmBody h5, #messagebody div.rcmBody h6 {color: black;line-height: 100%}#messagebody div.rcmBody a, #messagebody div.rcmBody a:link {color: #2A5DB0;text-decoration: underline}#messagebody div.rcmBody,#messagebody div.rcmBody #body_style {font-size: 16px;font-family: Helvetica, Arial, sans-serif;color: #202020;background: #FAFAFA}#messagebody div.rcmBody span.yshortcuts {color: #202020;background-color: none;border: none}#messagebody div.rcmBody span.yshortcuts:hover,#messagebody div.rcmBody span.yshortcuts:active,#messagebody div.rcmBody span.yshortcuts:focus {color: #202020;background-color: none;border: none}#messagebody div.rcmBody a:visited {color: #3C96E2;text-decoration: none}#messagebody div.rcmBody a:focus {color: #3C96E2;text-decoration: underline}#messagebody div.rcmBody a:hover {color: #3C96E2;text-decoration: underline}@media only screen and (max-device-width: 599px) {#messagebody div.rcmBody div[id=body_style] {padding-bottom: 8px !important}#messagebody div.rcmBody table[class=w550],#messagebody div.rcmBody table[class=w600] {width: 100% !important}#messagebody div.rcmBody td[class=padding24] {padding-left: 16px !important;padding-right: 16px !important}#messagebody div.rcmBody td[class=heading] {padding-top: 24px !important; padding-bottom: 24px !important; padding-left: 16px !important; padding-right: 16px !important; font-size: 20px !important}#messagebody div.rcmBody td[class=headingBorder] {padding-bottom: 24px !important}#messagebody div.rcmBody td[class=maincontent] {padding-left: 16px !important;padding-right: 16px !important;padding-bottom: 32px !important}#messagebody div.rcmBody img[class=icon] {height: 150px !important}#messagebody div.rcmBody td[class=title] {font-size: 24px !important}#messagebody div.rcmBody td[class=introduction] {font-size: 18px !important}#messagebody div.rcmBody td[class=signature] {padding-top: 24px !important}}</style></head><body><div id='messagebody'><div class='message-htmlpart' style='background-color: #FAFAFA'><div class='rcmBody' style='line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><div id='body_style' style='padding-top: 8px; padding-bottom: 24px; padding-left: 8px; padding-right: 8px; line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><table class='w600' cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='600' align='center' style='width: 600px; line-height: 24px; border-radius: 20px'><tbody><tr><td class='maincontent' style='padding-top: 13px; padding-left: 72px; padding-right: 72px; padding-bottom: 72px'><table cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='100%' style='width: 100%; border-collapse: collapse'><tbody><tr><td align='center' style='padding-top: 0px; padding-bottom: 0px'><img class='icon' src='cid:pictomail' height='125' border='0' style='display: block; height: 125px; line-height: 54px; font-size: 40px; font-family: Helvetica,Arial,sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; color: #7795f8'></td></tr><tr><td class='introduction' style='padding-top: 27px; padding-bottom: 0px; line-height: 27px; font-size: 20px; text-align: center; font-weight: bold;color: #F48493'>Merci de votre confiance</td></tr><tr><td style='padding-top: 9px; padding-bottom: 12px; line-height: 30px; border-top: solid 0px #e9f1f6; border-bottom: solid 1px #e9f1f6'><br><br><span style='font-size: 18px; color: #272645'>Bonjour, <br>Votre demande de création de compte a bien été reçue et sera traitée dans les meilleurs délais.<br>A bientôt,</span></td></tr><tr><td style='padding-top: 50px; padding-bottom: 0px; line-height: 19px; font-size: 16px; text-align: left; color: #272645'>Les équipes IDemat</td></tr></tbody></table></td></tr></tbody></table><table class='w600' cellpadding='0' cellspacing='0' border='0' width='600' align='center' style='width: 600px; line-height: 24px; border: 0'><tbody><tr><td align='center' style='padding-top: 13px; line-height: 14px; font-size: 12px; text-align: center; color: #bfc6d0'>Ce message est généré automatiquement, merci de ne pas y répondre.</td></tr></tbody></table></div></div></div></div></body></html>");

                //Envoi mail exploitant
                string strRetMailExpl = EnvoiMail(Variables.strMailNotificationDemandeWebApp, "IDbat - Une nouvelle demande de création de carte est arrivée via IDemat", "<html dir = 'ltr' lang = 'en' class=''><charset='utf-8'><style type = 'text/css' >#messagebody div.rcmBody .ExternalClass {width: 100%}#messagebody div.rcmBody .ExternalClass, #messagebody div.rcmBody .ExternalClass p, #messagebody div.rcmBody .ExternalClass span, #messagebody div.rcmBody .ExternalClass font, #messagebody div.rcmBody .ExternalClass td, #messagebody div.rcmBody .ExternalClass div {line-height: 100%}#messagebody div.rcmBody {-webkit-text-size-adjust: none;-ms-text-size-adjust: none}#messagebody div.rcmBody {margin: 0;padding: 0}#messagebody div.rcmBody table td {border-collapse: collapse}#messagebody div.rcmBody p {margin: 0;padding: 0;margin-bottom: 0}#messagebody div.rcmBody h1, #messagebody div.rcmBody h2, #messagebody div.rcmBody h3, #messagebody div.rcmBody h4, #messagebody div.rcmBody h5, #messagebody div.rcmBody h6 {color: black;line-height: 100%}#messagebody div.rcmBody a, #messagebody div.rcmBody a:link {color: #2A5DB0;text-decoration: underline}#messagebody div.rcmBody,#messagebody div.rcmBody #body_style {font-size: 16px;font-family: Helvetica, Arial, sans-serif;color: #202020;background: #FAFAFA}#messagebody div.rcmBody span.yshortcuts {color: #202020;background-color: none;border: none}#messagebody div.rcmBody span.yshortcuts:hover,#messagebody div.rcmBody span.yshortcuts:active,#messagebody div.rcmBody span.yshortcuts:focus {color: #202020;background-color: none;border: none}#messagebody div.rcmBody a:visited {color: #3C96E2;text-decoration: none}#messagebody div.rcmBody a:focus {color: #3C96E2;text-decoration: underline}#messagebody div.rcmBody a:hover {color: #3C96E2;text-decoration: underline}@media only screen and (max-device-width: 599px) {#messagebody div.rcmBody div[id=body_style] {padding-bottom: 8px !important}#messagebody div.rcmBody table[class=w550],#messagebody div.rcmBody table[class=w600] {width: 100% !important}#messagebody div.rcmBody td[class=padding24] {padding-left: 16px !important;padding-right: 16px !important}#messagebody div.rcmBody td[class=heading] {padding-top: 24px !important; padding-bottom: 24px !important; padding-left: 16px !important; padding-right: 16px !important; font-size: 20px !important}#messagebody div.rcmBody td[class=headingBorder] {padding-bottom: 24px !important}#messagebody div.rcmBody td[class=maincontent] {padding-left: 16px !important;padding-right: 16px !important;padding-bottom: 32px !important}#messagebody div.rcmBody img[class=icon] {height: 150px !important}#messagebody div.rcmBody td[class=title] {font-size: 24px !important}#messagebody div.rcmBody td[class=introduction] {font-size: 18px !important}#messagebody div.rcmBody td[class=signature] {padding-top: 24px !important}}</style></head><body><div id='messagebody'><div class='message-htmlpart' style='background-color: #FAFAFA'><div class='rcmBody' style='line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><div id='body_style' style='padding-top: 8px; padding-bottom: 24px; padding-left: 8px; padding-right: 8px; line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><table class='w600' cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='600' align='center' style='width: 600px; line-height: 24px; border-radius: 20px'><tbody><tr><td class='maincontent' style='padding-top: 13px; padding-left: 72px; padding-right: 72px; padding-bottom: 72px'><table cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='100%' style='width: 100%; border-collapse: collapse'><tbody><tr><td align='center' style='padding-top: 0px; padding-bottom: 0px'><img class='icon' src='cid:pictomail' height='125' border='0' style='display: block; height: 125px; line-height: 54px; font-size: 40px; font-family: Helvetica,Arial,sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; color: #7795f8'></td></tr><tr><td style='padding-top: 9px; padding-bottom: 12px; line-height: 30px; border-top: solid 0px #e9f1f6; border-bottom: solid 1px #e9f1f6'><br><br><span style='font-size: 18px; color: #272645'>Bonjour, <br>Connectez vous à IDbat pour la contrôler et la valider : <a href='" + _config.GetValue<string>("IDbat:URLIDbat") + "/lstValidationDemandesWA.aspx'>" + _config.GetValue<string>("IDbat:URLIDbat") + "/lstValidationDemandesWA.aspx</a></span></td></tr></tbody></table></td></tr></tbody></table><table class='w600' cellpadding='0' cellspacing='0' border='0' width='600' align='center' style='width: 600px; line-height: 24px; border: 0'><tbody><tr><td align='center' style='padding-top: 13px; line-height: 14px; font-size: 12px; text-align: center; color: #bfc6d0'>Ce message est généré automatiquement, merci de ne pas y répondre.</td></tr></tbody></table></div></div></div></div></body></html>");

                return RedirectToPage("../DemandeOK", new { contratURL = contratencours.URL, msg = strRetMail });

            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/chat/");
                return RedirectToPage("../Error", new { strMessage = "3 - " + ex.Message });
            }
        }

        public async Task<IActionResult> OnPostEnregistrerProAsync()
        {
            string tempErr = "";
            try
            {
                Variables.erreurCivilite = false;
                Variables.erreurNom = false;
                Variables.erreurPrenom = false;
                Variables.erreurSociete = false;
                Variables.erreurSIRET = false;
                Variables.erreurAdresse = false;
                //Variables.erreurCodePostal = false;
                Variables.erreurVille = false;
                Variables.erreurMail = false;
                Variables.erreurTelephone = false;
                Variables.erreurTypeCarte = false;
                Variables.erreurMentionsLegales = false;
                Variables.erreurKB = false;
                Variables.erreurEmail = "";
                bool blnErreur = false;

                if (!ModelState.IsValid)
                {
                    //Usager.Price = Convert.ToDecimal(ModelState["Usager.Price"].AttemptedValue.Replace('.', ','));
                    //ModelState["Usager.Price"].Errors.Clear();
                    //ModelState.Clear();
                    //if (!TryValidateModel(Usager, nameof(Usager)))
                    //{
                    //    return Page();
                    //}
                    Variables.idEnseigne = Usager.IdEnseigne;
                    Variables.strImmatriculations = Usager.strImmatriculations ?? "";
                    if (Variables.strImmatriculations == "Ajouter un véhicule :") { Variables.strImmatriculations = ""; }
                    Variables.guidCreation = Usager.GuidUsager;
                    Variables.strPartOuPro = strChoixPartOuPro;

                    Communes = _context.RefsCommunes.Where(c => c.IdEnseigne == Usager.IdEnseigne).Select(cv => new SelectListItem
                    {
                        Value = cv.CPVille,
                        Text = cv.CPVille
                    })
                    .ToList();

                    return Page();
                }

                //Usager.GuidUsager = Variables.guidCreation;

                if (blnMentionsLegales == false)
                {
                    Variables.erreurMentionsLegales = true;
                    blnErreur = true;
                }

                if (Usager.Societe == null)
                {
                    Variables.erreurSociete = true;
                    blnErreur = true;
                }

                if (Usager.SIRET == null)
                {
                    Variables.erreurSIRET = true;
                    blnErreur = true;
                }

                if (Usager.Adresse == null)
                {
                    Variables.erreurAdresse = true;
                    blnErreur = true;
                }

                //if (Usager.CP == null)
                //{
                //    Variables.erreurCodePostal = true;
                //    blnErreur = true;
                //}

                if (Usager.CPVille == null || Usager.CPVille == "")
                {
                    Variables.erreurVille = true;
                    blnErreur = true;
                }

                if (Usager.Email == null)
                {
                    Variables.erreurMail = true;
                    blnErreur = true;
                }
                else
                {
                    Variables.erreurEmail = CheckEmail(Usager.Email);
                    if (Variables.erreurEmail != "")
                    {
                        blnErreur = true;
                    }

                    //contrôle unicité e-mail (2 étapes : contrôle dans les usagers déjà existants, et dans les demandes encore en cours)
                    Usager usagerpourrecherchemail = _context.Usagers.Where(c => c.IdEnseigne == Usager.IdEnseigne && c.Login == Usager.Email).FirstOrDefault();
                    if (usagerpourrecherchemail != null)
                    {
                        Variables.erreurUniciteEmail = true;
                        blnErreur = true;
                    }

                    DemandeUsager demandecreationpourrecherchemail = _context.DemandesUsagers.Where(c => c.IdEnseigne == Usager.IdEnseigne && c.Email == Usager.Email).FirstOrDefault();
                    if (demandecreationpourrecherchemail != null)
                    {
                        Variables.erreurUniciteEmail = true;
                        blnErreur = true;
                    }
                }

                Contrat contratencours = _context.Contrats.Where(c => c.Id == Usager.IdEnseigne).FirstOrDefault();
                if (contratencours != null)
                {
                    Communes = _context.RefsCommunes.Where(c => c.IdEnseigne == contratencours.Id).Select(cv => new SelectListItem
                    {
                        Value = cv.CPVille,
                        Text = cv.CPVille
                    })
                    .ToList();

                    ZoneJ1CG = new List<SelectListItem>();
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTL",
                        Text = "MTL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT1",
                        Text = "MTT1"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "MTT2",
                        Text = "MTT2"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TM",
                        Text = "TM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "QM",
                        Text = "QM"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CYCL",
                        Text = "CYCL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CL",
                        Text = "CL"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "VP",
                        Text = "VP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "TCP",
                        Text = "TCP"
                    });
                    ZoneJ1CG.Add(new SelectListItem
                    {
                        Value = "CTTE",
                        Text = "CTTE"
                    });

                    Variables.blnCarteDemat = contratencours.EnseigneCarteDemat;
                    Variables.blnCartePhysique = contratencours.EnseigneCartePhysique;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;
                    Variables.blnImmatriculationsPros = contratencours.EnseigneImmatriculationsPros; //inutile pour l'instant
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.strMentionsLegales = contratencours.MentionsLegales.Replace("< ", "<");

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                }
                if (Variables.blnCarteDemat && !Variables.blnCartePhysique) { Usager.TypeCarte = "Carte dématérialisée"; }
                if (Variables.blnCartePhysique && !Variables.blnCarteDemat) { Usager.TypeCarte = "Carte physique"; }
                if (Variables.blnCarteDemat && Variables.blnCartePhysique)
                {
                    if (Usager.TypeCarte == null)
                    {
                        Variables.erreurTypeCarte = true;
                        blnErreur = true;
                    }
                }
                if (contratencours.DemandeZoneJ1F3)
                {
                    if ((Usager.ImmatEnCours ?? "") != "" && ((Usager.ImmatJ1EnCours ?? "") == "" || (Usager.ImmatF3EnCours ?? "") == ""))
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                }
                if (Usager.ImmatF3EnCours != null)
                {
                    if (Usager.ImmatF3EnCours.Trim() != "")
                    {
                        if (!int.TryParse(Usager.ImmatF3EnCours, out int result))
                        {
                            Variables.erreurF3 = true;
                            blnErreur = true;
                        }
                    }
                }
                if ((Usager.ImmatEnCours ?? "") != "" && UploadCG == null)
                {
                    Variables.erreurCG = true;
                    blnErreur = true;
                }
                if (UploadKB == null)
                {
                    Variables.erreurKB = true;
                    blnErreur = true;
                }
                if (blnErreur)
                {
                    //Variables.callingURL = callingURL;
                    Variables.idEnseigne = Usager.IdEnseigne;
                    Variables.strImmatriculations = Usager.strImmatriculations ?? "";
                    Variables.guidCreation = Usager.GuidUsager;
                    Variables.strPartOuPro = strChoixPartOuPro;

                    return Page();
                }

                if (Usager.strImmatriculations == null || Usager.strImmatriculations == "" || Usager.strImmatriculations == "Ajouter un véhicule :")
                {
                    Usager.strImmatriculations = Usager.ImmatEnCours + " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                }
                else
                {
                    Usager.strImmatriculations += ";" + Usager.ImmatEnCours + " (" + Usager.ImmatJ1EnCours + "-" + Usager.ImmatF3EnCours + " kg)";
                }

                tempErr += "1";
                Usager.NomPrenom = (Usager.Nom ?? "").Trim() + " " + (Usager.Prenom ?? "").Trim();
                tempErr += "2";
                if ((Usager.NomPrenom ?? "").Trim() == "")
                {
                    tempErr += "3";
                    Usager.NomPrenom = Usager.Societe;
                    tempErr += "4";
                }
                tempErr += "5";

                Usager.CP = Usager.CPVille.Substring(0, 5);
                Usager.Ville = Usager.CPVille.Substring(6);

                _context.DemandesUsagers.Add(Usager);
                tempErr += "6";
                await _context.SaveChangesAsync();

                try
                {
                    var fileKB = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("KB_", Usager.GuidUsager.ToString(), "_", UploadKB.FileName));
                    using (var fileStream = new FileStream(fileKB, FileMode.Create))
                    {
                        await UploadKB.CopyToAsync(fileStream);
                    }

                    if ((Usager.ImmatEnCours ?? "") != "")
                    {
                        //var fileCG = Path.Combine(_environment.ContentRootPath, "uploads", string.Concat("CG_", Usager.GuidUsager.ToString(), "_", Usager.ImmatEnCours, "_", UploadCG.FileName));
                        //Au-dessus envoi dans le répertoire de l'application, en-dessous essai d'envoi dans un répertoire autre (le même que le MC)
                        var fileCG = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CG_", Usager.GuidUsager.ToString(), "_", Usager.ImmatEnCours, "_", UploadCG.FileName));
                        using (var fileStream = new FileStream(fileCG, FileMode.Create))
                        {
                            await UploadCG.CopyToAsync(fileStream);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Variables.erreurDebug = ex.Message;
                    Variables.idEnseigne = Usager.IdEnseigne;
                    Variables.strImmatriculations = Usager.strImmatriculations ?? "";
                    Variables.guidCreation = Usager.GuidUsager;
                    Variables.strPartOuPro = strChoixPartOuPro;

                    return Page();
                }

                //Envoi mail demandeur
                //bool blnRetMail = EnvoiMail("bertrand@hermess.fr;" + Usager.Email, "IDemat - Merci de votre confiance", "<body>Bonjour<br/>ça semble fonctionner :-)</body>");
                string strRetMail = EnvoiMail(Usager.Email, "IDemat - Merci de votre confiance", "<html dir='ltr' lang='en' class=''><charset='utf-8'><style type='text/css'>#messagebody div.rcmBody .ExternalClass {width: 100%}#messagebody div.rcmBody .ExternalClass, #messagebody div.rcmBody .ExternalClass p, #messagebody div.rcmBody .ExternalClass span, #messagebody div.rcmBody .ExternalClass font, #messagebody div.rcmBody .ExternalClass td, #messagebody div.rcmBody .ExternalClass div {line-height: 100%}#messagebody div.rcmBody {-webkit-text-size-adjust: none;-ms-text-size-adjust: none}#messagebody div.rcmBody {margin: 0;padding: 0}#messagebody div.rcmBody table td {border-collapse: collapse}#messagebody div.rcmBody p {margin: 0;padding: 0;margin-bottom: 0}#messagebody div.rcmBody h1, #messagebody div.rcmBody h2, #messagebody div.rcmBody h3, #messagebody div.rcmBody h4, #messagebody div.rcmBody h5, #messagebody div.rcmBody h6 {color: black;line-height: 100%}#messagebody div.rcmBody a, #messagebody div.rcmBody a:link {color: #2A5DB0;text-decoration: underline}#messagebody div.rcmBody,#messagebody div.rcmBody #body_style {font-size: 16px;font-family: Helvetica, Arial, sans-serif;color: #202020;background: #FAFAFA}#messagebody div.rcmBody span.yshortcuts {color: #202020;background-color: none;border: none}#messagebody div.rcmBody span.yshortcuts:hover,#messagebody div.rcmBody span.yshortcuts:active,#messagebody div.rcmBody span.yshortcuts:focus {color: #202020;background-color: none;border: none}#messagebody div.rcmBody a:visited {color: #3C96E2;text-decoration: none}#messagebody div.rcmBody a:focus {color: #3C96E2;text-decoration: underline}#messagebody div.rcmBody a:hover {color: #3C96E2;text-decoration: underline}@media only screen and (max-device-width: 599px) {#messagebody div.rcmBody div[id=body_style] {padding-bottom: 8px !important}#messagebody div.rcmBody table[class=w550],#messagebody div.rcmBody table[class=w600] {width: 100% !important}#messagebody div.rcmBody td[class=padding24] {padding-left: 16px !important;padding-right: 16px !important}#messagebody div.rcmBody td[class=heading] {padding-top: 24px !important; padding-bottom: 24px !important; padding-left: 16px !important; padding-right: 16px !important; font-size: 20px !important}#messagebody div.rcmBody td[class=headingBorder] {padding-bottom: 24px !important}#messagebody div.rcmBody td[class=maincontent] {padding-left: 16px !important;padding-right: 16px !important;padding-bottom: 32px !important}#messagebody div.rcmBody img[class=icon] {height: 150px !important}#messagebody div.rcmBody td[class=title] {font-size: 24px !important}#messagebody div.rcmBody td[class=introduction] {font-size: 18px !important}#messagebody div.rcmBody td[class=signature] {padding-top: 24px !important}}</style></head><body><div id='messagebody'><div class='message-htmlpart' style='background-color: #FAFAFA'><div class='rcmBody' style='line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><div id='body_style' style='padding-top: 8px; padding-bottom: 24px; padding-left: 8px; padding-right: 8px; line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><table class='w600' cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='600' align='center' style='width: 600px; line-height: 24px; border-radius: 20px'><tbody><tr><td class='maincontent' style='padding-top: 13px; padding-left: 72px; padding-right: 72px; padding-bottom: 72px'><table cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='100%' style='width: 100%; border-collapse: collapse'><tbody><tr><td align='center' style='padding-top: 0px; padding-bottom: 0px'><img class='icon' src='cid:pictomail' height='125' border='0' style='display: block; height: 125px; line-height: 54px; font-size: 40px; font-family: Helvetica,Arial,sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; color: #7795f8'></td></tr><tr><td class='introduction' style='padding-top: 27px; padding-bottom: 0px; line-height: 27px; font-size: 20px; text-align: center; font-weight: bold;color: #F48493'>Merci de votre confiance</td></tr><tr><td style='padding-top: 9px; padding-bottom: 12px; line-height: 30px; border-top: solid 0px #e9f1f6; border-bottom: solid 1px #e9f1f6'><br><br><span style='font-size: 18px; color: #272645'>Bonjour, <br>Votre demande de création de compte a bien été reçue et sera traitée dans les meilleurs délais.<br>A bientôt,</span></td></tr><tr><td style='padding-top: 50px; padding-bottom: 0px; line-height: 19px; font-size: 16px; text-align: left; color: #272645'>Les équipes IDemat</td></tr></tbody></table></td></tr></tbody></table><table class='w600' cellpadding='0' cellspacing='0' border='0' width='600' align='center' style='width: 600px; line-height: 24px; border: 0'><tbody><tr><td align='center' style='padding-top: 13px; line-height: 14px; font-size: 12px; text-align: center; color: #bfc6d0'>Ce message est généré automatiquement, merci de ne pas y répondre.</td></tr></tbody></table></div></div></div></div></body></html>");

                //Envoi mail exploitant
                string strRetMailExpl = EnvoiMail(Variables.strMailNotificationDemandeWebApp, "IDbat - Une nouvelle demande de création de carte est arrivée via IDemat", "<html dir = 'ltr' lang = 'en' class=''><charset='utf-8'><style type = 'text/css' >#messagebody div.rcmBody .ExternalClass {width: 100%}#messagebody div.rcmBody .ExternalClass, #messagebody div.rcmBody .ExternalClass p, #messagebody div.rcmBody .ExternalClass span, #messagebody div.rcmBody .ExternalClass font, #messagebody div.rcmBody .ExternalClass td, #messagebody div.rcmBody .ExternalClass div {line-height: 100%}#messagebody div.rcmBody {-webkit-text-size-adjust: none;-ms-text-size-adjust: none}#messagebody div.rcmBody {margin: 0;padding: 0}#messagebody div.rcmBody table td {border-collapse: collapse}#messagebody div.rcmBody p {margin: 0;padding: 0;margin-bottom: 0}#messagebody div.rcmBody h1, #messagebody div.rcmBody h2, #messagebody div.rcmBody h3, #messagebody div.rcmBody h4, #messagebody div.rcmBody h5, #messagebody div.rcmBody h6 {color: black;line-height: 100%}#messagebody div.rcmBody a, #messagebody div.rcmBody a:link {color: #2A5DB0;text-decoration: underline}#messagebody div.rcmBody,#messagebody div.rcmBody #body_style {font-size: 16px;font-family: Helvetica, Arial, sans-serif;color: #202020;background: #FAFAFA}#messagebody div.rcmBody span.yshortcuts {color: #202020;background-color: none;border: none}#messagebody div.rcmBody span.yshortcuts:hover,#messagebody div.rcmBody span.yshortcuts:active,#messagebody div.rcmBody span.yshortcuts:focus {color: #202020;background-color: none;border: none}#messagebody div.rcmBody a:visited {color: #3C96E2;text-decoration: none}#messagebody div.rcmBody a:focus {color: #3C96E2;text-decoration: underline}#messagebody div.rcmBody a:hover {color: #3C96E2;text-decoration: underline}@media only screen and (max-device-width: 599px) {#messagebody div.rcmBody div[id=body_style] {padding-bottom: 8px !important}#messagebody div.rcmBody table[class=w550],#messagebody div.rcmBody table[class=w600] {width: 100% !important}#messagebody div.rcmBody td[class=padding24] {padding-left: 16px !important;padding-right: 16px !important}#messagebody div.rcmBody td[class=heading] {padding-top: 24px !important; padding-bottom: 24px !important; padding-left: 16px !important; padding-right: 16px !important; font-size: 20px !important}#messagebody div.rcmBody td[class=headingBorder] {padding-bottom: 24px !important}#messagebody div.rcmBody td[class=maincontent] {padding-left: 16px !important;padding-right: 16px !important;padding-bottom: 32px !important}#messagebody div.rcmBody img[class=icon] {height: 150px !important}#messagebody div.rcmBody td[class=title] {font-size: 24px !important}#messagebody div.rcmBody td[class=introduction] {font-size: 18px !important}#messagebody div.rcmBody td[class=signature] {padding-top: 24px !important}}</style></head><body><div id='messagebody'><div class='message-htmlpart' style='background-color: #FAFAFA'><div class='rcmBody' style='line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><div id='body_style' style='padding-top: 8px; padding-bottom: 24px; padding-left: 8px; padding-right: 8px; line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><table class='w600' cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='600' align='center' style='width: 600px; line-height: 24px; border-radius: 20px'><tbody><tr><td class='maincontent' style='padding-top: 13px; padding-left: 72px; padding-right: 72px; padding-bottom: 72px'><table cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='100%' style='width: 100%; border-collapse: collapse'><tbody><tr><td align='center' style='padding-top: 0px; padding-bottom: 0px'><img class='icon' src='cid:pictomail' height='125' border='0' style='display: block; height: 125px; line-height: 54px; font-size: 40px; font-family: Helvetica,Arial,sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; color: #7795f8'></td></tr><tr><td style='padding-top: 9px; padding-bottom: 12px; line-height: 30px; border-top: solid 0px #e9f1f6; border-bottom: solid 1px #e9f1f6'><br><br><span style='font-size: 18px; color: #272645'>Bonjour, <br>Connectez vous à IDbat pour la contrôler et la valider : <a href='" + _config.GetValue<string>("IDbat:URLIDbat") + "/lstValidationDemandesWA.aspx'>" + _config.GetValue<string>("IDbat:URLIDbat") + "/lstValidationDemandesWA.aspx</a></span></td></tr></tbody></table></td></tr></tbody></table><table class='w600' cellpadding='0' cellspacing='0' border='0' width='600' align='center' style='width: 600px; line-height: 24px; border: 0'><tbody><tr><td align='center' style='padding-top: 13px; line-height: 14px; font-size: 12px; text-align: center; color: #bfc6d0'>Ce message est généré automatiquement, merci de ne pas y répondre.</td></tr></tbody></table></div></div></div></div></body></html>");

                return RedirectToPage("../DemandeOK", new { contratURL = contratencours.URL, msg = strRetMail });
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/chat/");
                return RedirectToPage("../Error", new { strMessage = tempErr + " - 4 - " + ex.Message });
            }
        }

        private string EnvoiMail(string A, string Sujet, string Corps)
        {
            try
            {
                MailMessage message = new MailMessage();

                byte[] reader = System.IO.File.ReadAllBytes(Path.Combine(_environment.ContentRootPath, "wwwroot/Images", "picto_mail.jpg"));
                MemoryStream image1 = new MemoryStream(reader);
                AlternateView av = AlternateView.CreateAlternateViewFromString(Corps, null, System.Net.Mime.MediaTypeNames.Text.Html);

                LinkedResource picto = new LinkedResource(image1, System.Net.Mime.MediaTypeNames.Image.Jpeg);
                picto.ContentId = "pictomail";
                picto.ContentType = new System.Net.Mime.ContentType("image/jpg");
                av.LinkedResources.Add(picto);

                message.IsBodyHtml = true;
                message.From = new MailAddress(_config.GetValue<string>("IDbat:Expediteur"));

                string[] strMailTos = A.Split(";");
                foreach (string strMailTo in strMailTos)
                {
                    message.To.Add(new MailAddress(strMailTo));
                }
                //message.To.Add(new MailAddress("bertrand@hermess.fr"));

                message.Subject = Sujet;
                //message.Body = Corps;

                message.AlternateViews.Add(av);

                System.Net.Mime.ContentType mimeType = new System.Net.Mime.ContentType("text/html");
                AlternateView alternate = AlternateView.CreateAlternateViewFromString(Corps, mimeType);
                message.AlternateViews.Add(alternate);

                SmtpClient client = new SmtpClient(_config.GetValue<string>("IDbat:IP_SMTP"));

                client.SendAsync(message, "");

                return A;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                EnregistreErreurEnvoiMail(ex, A, Sujet, Corps, "");
                return ex.Message;
            }
        }

        private bool EnregistreErreurEnvoiMail(Exception exEnvoiMail, string A, string Sujet, string Corps, string PieceJointe)
        {
            try
            {
                _context.Database.ExecuteSqlRaw("INSERT INTO TB_ERREURSENVOIMAIL (STR_DATEHEURE, STR_ERREUR, STR_SUJET, STR_DESTINATAIRES, STR_CORPS, BLN_PIECESJOINTES) VALUES ('" + DateTime.Now.ToString("yyyyMMddHHmmss") + "','" + exEnvoiMail.Message.Replace("'", "''") + "','" + Sujet.Replace("'", "''") + "','" + A.Replace("'", "''") + "','" + Corps.Replace("'", "''") + "'," + (PieceJointe != "" ? 1 : 0).ToString() + ")");

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        private string CheckEmail(string p_strEMail)
        {
            if (p_strEMail == null)
            {
                return "L'e-mail est obligatoire";
            }

            if (!p_strEMail.Contains("@"))
            {
                return "L'e-mail doit contenir le caractère '@'";
            }

            if (p_strEMail.Split("@").Length - 1 > 1)
            {
                return "L'e-mail doit contenir une seule fois le caractère '@'";
            }

            if (p_strEMail.StartsWith("@"))
            {
                return "L'e-mail ne peut pas commencer par le caractère '@'";
            }

            if (p_strEMail.EndsWith("@"))
            {
                return "L'e-mail ne peut pas se terminer par le caractère '@'";
            }

            if (!p_strEMail.Contains("."))
            {
                return "L'e-mail doit contenir le caractère '.'";
            }

            if (p_strEMail.StartsWith("."))
            {
                return "L'e-mail ne peut pas commencer par le caractère '.'";
            }

            if (p_strEMail.EndsWith("."))
            {
                return "L'e-mail ne pas se terminer par le caractère '.'";
            }

            if (!p_strEMail.Substring(p_strEMail.IndexOf("@") + 1).Contains("."))
            {
                return "L'e-mail doit contenir le caractère '.' après le caractère '@'";
            }

            if (!p_strEMail.Substring(p_strEMail.IndexOf("@") + 2).Contains("."))
            {
                return "L'e-mail doit contenir le caractère '.' après le caractère '@', avec au moins un caractère intercalé";
            }

            return "";
        }

        //public async Task<IActionResult> OnPostValiderAsync()
        //{
        //    bool blnErreur = false;

        //    if (!ModelState.IsValid)
        //    {
        //        //return Page();
        //        return RedirectToPage("./Error", new { strMessage = "" });
        //    }

        //    //Usager.GuidUsager = Variables.guidCreation;

        //    Variables.strPartOuPro = strPartOuPro;
        //    return Redirect("https://pixabay.com/fr/images/search/" + strPartOuPro + "/");

        //    //return Page();
        //}

    }
}
