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
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Net.Mail;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace IDemat.Pages
{
    public class ModificationProfilModel : PageModel
    {
        private readonly IDemat.Data.IDematContext _context;
        private IWebHostEnvironment _environment;
        private readonly IConfiguration _config;

        public ModificationProfilModel(IDemat.Data.IDematContext context, IWebHostEnvironment environment, IConfiguration config)
        {
            _context = context;
            _environment = environment;
            _config = config;
        }

        [BindProperty(SupportsGet = true)]
        public Guid guidUsager { get; set; }
        [BindProperty]
        public Usager Usager { get; set; }
        [BindProperty]
        public DemandeAjoutVehicule AjoutVehicule { get; set; }
        [BindProperty]
        public IFormFile UploadCG { get; set; }
        [BindProperty]
        public IDemat.Global.Variables Variables { get; set; }
        [BindProperty]
        public List<SelectListItem> ZoneJ1CG { get; set; }

        public async Task<IActionResult> OnGetAsync(string usagerGuid)
        {
            Variables = new IDemat.Global.Variables();
            AjoutVehicule = new DemandeAjoutVehicule();

            try
            {
                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));
                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();

                Contrat contratencours = _context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault();

                if (contratencours != null)
                {
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
                    
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                    Variables.blnPossibiliteAchatPassages = (_context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault().NbPassagesAchetables is not null);

                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/chat/");
                    return RedirectToPage("./Error", new { strMessage = "1" });
                }

                if (Variables.usageractif != null)
                {
                    Variables.guidUsager = guidUsager;
                    Usager = Variables.usageractif;

                    Variables.nomUsager = Variables.usageractif.Nom;

                    //Variables.strImmatriculations = "Ajouter un véhicule :";
                    Variables.strImmatriculations = "-";
                    //Variables.strImmatriculationsAnciennes = Usager.strImmatriculations ?? "";
                    List<String> Immats = _context.UsagersImmats.Where(c => c.GuidUsager == Usager.GuidUsager).Select(c => c.Immat).ToList();
                    Variables.strImmatriculationsAnciennes = string.Join(";", Immats);

                    return Page();
                }
                else
                {
                    //return Redirect("https://pixabay.com/fr/images/search/panda/");
                    return RedirectToPage("./Error", new { strMessage = "2" });
                }
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message + " - " + Variables.urlContrat + "/");
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        public async Task<IActionResult> OnPostAjoutImmatAsync(string usagerGuid, string strImmatriculationsAnciennes, string strImmatriculations)
        {
            try
            {
                bool blnErreur = false;

                Variables.erreurCG = false;

                Variables.strImmatriculations = strImmatriculations;

                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));
                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                Usager = Variables.usageractif;
                //Variables.strImmatriculationsAnciennes = Usager.strImmatriculations ?? "";
                Variables.strImmatriculationsAnciennes = strImmatriculationsAnciennes ?? "";

                Contrat contratencours = _context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault();

                if (contratencours != null)
                {
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
                    
                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                }

                //if ((AjoutVehicule.ImmatEnCours ?? "") != "")
                //{
                //    if (UploadCG == null)
                //    {
                //        Variables.erreurCG = true;
                //    }
                //    else
                //    {
                //        if (strImmatriculations == null || strImmatriculations == "" || strImmatriculations == "-" || strImmatriculations == "Ajouter un véhicule :")
                //        {
                //            //Variables.strImmatriculations = DateTime.Now.ToShortTimeString();
                //            Variables.strImmatriculations = AjoutVehicule.ImmatEnCours;
                //            if (contratencours.DemandeZoneJ1F3)
                //            {
                //                Variables.strImmatriculations += " (" + AjoutVehicule.ImmatJ1EnCours + "-" + AjoutVehicule.ImmatF3EnCours + " kg)";
                //            }
                //        }
                //        else
                //        {
                //            //Variables.strImmatriculations += ";" + DateTime.Now.ToShortTimeString();
                //            Variables.strImmatriculations += ";" + AjoutVehicule.ImmatEnCours;
                //            if (contratencours.DemandeZoneJ1F3)
                //            {
                //                Variables.strImmatriculations += " (" + AjoutVehicule.ImmatJ1EnCours + "-" + AjoutVehicule.ImmatF3EnCours + " kg)";
                //            }
                //        }

                //        try
                //        {
                //            var fileCG = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CG_", guidUsager.ToString(), "_", AjoutVehicule.ImmatEnCours, "_", UploadCG.FileName));
                //            using (var fileStream = new FileStream(fileCG, FileMode.Create))
                //            {
                //                await UploadCG.CopyToAsync(fileStream);
                //            }
                //        }
                //        catch (Exception ex)
                //        {
                //            Variables.erreurDebug = ex.Message;
                //            return Page();
                //        }
                //        AjoutVehicule.ImmatEnCours = "";
                //        AjoutVehicule.ImmatJ1EnCours = "";
                //        AjoutVehicule.ImmatF3EnCours = "";
                //    }
                //}

                if (AjoutVehicule.ImmatEnCours == null)
                {
                    Variables.erreurImmat = true;
                    blnErreur = true;
                }
                else
                {
                    if (AjoutVehicule.ImmatEnCours.Trim() == "")
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                }
                if (contratencours.DemandeZoneJ1F3)
                {
                    if (AjoutVehicule.ImmatJ1EnCours == null)
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                    else
                    {
                        if (AjoutVehicule.ImmatJ1EnCours.Trim() == "")
                        {
                            Variables.erreurImmat = true;
                            blnErreur = true;
                        }
                    }
                    if (AjoutVehicule.ImmatF3EnCours == null)
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                    else
                    {
                        if (AjoutVehicule.ImmatF3EnCours.Trim() == "")
                        {
                            Variables.erreurImmat = true;
                            blnErreur = true;
                        }
                        else
                        {
                            if (!int.TryParse(AjoutVehicule.ImmatF3EnCours, out int result))
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
                    if (strImmatriculations == null || strImmatriculations == "" || strImmatriculations == "-" || strImmatriculations == "Ajouter un véhicule :")
                    {
                        //Variables.strImmatriculations = DateTime.Now.ToShortTimeString();
                        Variables.strImmatriculations = AjoutVehicule.ImmatEnCours;
                        if (contratencours.DemandeZoneJ1F3)
                        {
                            Variables.strImmatriculations += " (" + AjoutVehicule.ImmatJ1EnCours + "-" + AjoutVehicule.ImmatF3EnCours + " kg)";
                        }
                    }
                    else
                    {
                        //Variables.strImmatriculations += ";" + DateTime.Now.ToShortTimeString();
                        Variables.strImmatriculations += ";" + AjoutVehicule.ImmatEnCours;
                        if (contratencours.DemandeZoneJ1F3)
                        {
                            Variables.strImmatriculations += " (" + AjoutVehicule.ImmatJ1EnCours + "-" + AjoutVehicule.ImmatF3EnCours + " kg)";
                        }
                    }

                    try
                    {
                        var fileCG = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CG_", guidUsager.ToString(), "_", AjoutVehicule.ImmatEnCours, "_", UploadCG.FileName));
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
                    AjoutVehicule.ImmatEnCours = "";
                    AjoutVehicule.ImmatJ1EnCours = "";
                    AjoutVehicule.ImmatF3EnCours = "";
                }

                return Page();

            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message);
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        public async Task<IActionResult> OnPostSuppressionImmatAsync(string usagerGuid, string strImmatriculationsAnciennes, string strImmatriculations, string strImmatriculation)
        {
            try
            {
                Variables.strImmatriculations = strImmatriculations;

                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));
                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                Usager = Variables.usageractif;
                
                Variables.strImmatriculationsAnciennes = strImmatriculationsAnciennes.Replace(strImmatriculation, "").Replace(";;", ";");
                if (Variables.strImmatriculationsAnciennes.StartsWith(";")) { Variables.strImmatriculationsAnciennes = Variables.strImmatriculationsAnciennes.Substring(1); }
                if (Variables.strImmatriculationsAnciennes.EndsWith(";")) { Variables.strImmatriculationsAnciennes = Variables.strImmatriculationsAnciennes.Substring(0, Variables.strImmatriculationsAnciennes.Length - 1); }
                
                Contrat contratencours = _context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault();

                if (contratencours != null)
                {
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

                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                }

                return Page();

            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message);
                return RedirectToPage("./Error", new { strMessage = ex.Message });
            }
        }

        public async Task<IActionResult> OnPostValidationAsync(string usagerGuid, string strImmatsAnciennes, string strImmats)
        {
            try
            {
                bool blnErreur = false;

                Variables.erreurCG = false;

                Variables.strImmatriculations = strImmats;

                guidUsager = new Guid(Crypto.Decrypte(usagerGuid));
                Variables.usageractif = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                //Usager = Variables.usageractif;

                Contrat contratencours = _context.Contrats.Where(c => c.Id == Variables.usageractif.IdEnseigne).FirstOrDefault();

                if (contratencours != null)
                {
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

                    Variables.strMailNotificationDemandeWebApp = contratencours.MailNotificationDemandeWebApp;
                    Variables.blnImmatriculations = contratencours.EnseigneImmatriculations;
                    Variables.blnDemandeZoneJ1F3 = contratencours.DemandeZoneJ1F3;

                    string strURL = _config.GetValue<string>("IDbat:URLLogos");
                    if (!strURL.EndsWith("/"))
                    {
                        strURL += "/";
                    }
                    strURL += "Logo_";
                    Variables.strURLLogo = strURL + contratencours.Id.ToString() + ".png?version=" + DateTime.Now.Ticks.ToString();
                }

                bool blnAjoutVehicule = false;

                if (contratencours.DemandeZoneJ1F3)
                {
                    if ((AjoutVehicule.ImmatEnCours ?? "") != "" && ((AjoutVehicule.ImmatJ1EnCours ?? "") == "" || (AjoutVehicule.ImmatF3EnCours ?? "") == ""))
                    {
                        Variables.erreurImmat = true;
                        blnErreur = true;
                    }
                }
                if (AjoutVehicule.ImmatF3EnCours != null)
                {
                    if (AjoutVehicule.ImmatF3EnCours.Trim() != "")
                    {
                        if (!int.TryParse(AjoutVehicule.ImmatF3EnCours, out int result))
                        {
                            Variables.erreurF3 = true;
                            blnErreur = true;
                        }
                    }
                }

                if (blnErreur)
                {
                    //Variables.idEnseigne = Usager.IdEnseigne;
                    //Variables.strImmatriculations = Usager.strImmatriculations ?? "";
                    //Variables.guidCreation = Usager.GuidUsager;

                    return Page();
                }

                if ((AjoutVehicule.ImmatEnCours ?? "") != "")
                {
                    if (UploadCG == null)
                    {
                        Variables.erreurCG = true;

                        Usager = Variables.usageractif;
                        //Variables.strImmatriculationsAnciennes = Usager.strImmatriculations ?? "";
                        List<String> Immats = _context.UsagersImmats.Where(c => c.GuidUsager == Usager.GuidUsager).Select(c => c.Immat).ToList();
                        Variables.strImmatriculationsAnciennes = string.Join(";", Immats);

                        return Page();
                    }
                    else
                    {
                        if (strImmats == null || strImmats == "" || strImmats == "-" || strImmats == "Ajouter un véhicule :")
                        {
                            //Variables.strImmatriculations = DateTime.Now.ToShortTimeString();
                            Variables.strImmatriculations = AjoutVehicule.ImmatEnCours;
                            if (contratencours.DemandeZoneJ1F3)
                            {
                                Variables.strImmatriculations += " (" + AjoutVehicule.ImmatJ1EnCours + "-" + AjoutVehicule.ImmatF3EnCours + " kg)";
                            }
                        }
                        else
                        {
                            //Variables.strImmatriculations += ";" + DateTime.Now.ToShortTimeString();
                            Variables.strImmatriculations += ";" + AjoutVehicule.ImmatEnCours;
                            if (contratencours.DemandeZoneJ1F3)
                            {
                                Variables.strImmatriculations += " (" + AjoutVehicule.ImmatJ1EnCours + "-" + AjoutVehicule.ImmatF3EnCours + " kg)";
                            }
                        }

                        try
                        {
                            var fileCG = Path.Combine(_config.GetValue<string>("IDbat:CheminFichiers"), string.Concat("CG_", guidUsager.ToString(), "_", AjoutVehicule.ImmatEnCours, "_", UploadCG.FileName));
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
                        AjoutVehicule.ImmatEnCours = "";
                        AjoutVehicule.ImmatJ1EnCours = "";
                        AjoutVehicule.ImmatF3EnCours = "";
                    }
                }
                
                if (Variables.strImmatriculations != null && Variables.strImmatriculations != "" && Variables.strImmatriculations != "-" && Variables.strImmatriculations != "Ajouter un véhicule :")
                {
                    AjoutVehicule.guidUsager = guidUsager;
                    AjoutVehicule.strImmatriculations = Variables.strImmatriculations;
                    _context.DemandesAjoutsVehicules.Add(AjoutVehicule);
                    blnAjoutVehicule = true;
                    //await _context.SaveChangesAsync();
                }

                Usager usagerencours = _context.Usagers.Where(c => c.GuidUsager == guidUsager).FirstOrDefault();
                usagerencours.Telephone = (Usager.Telephone ?? "").Trim();
                usagerencours.strImmatriculations = strImmatsAnciennes;
                _context.Usagers.Update(usagerencours);
                await _context.SaveChangesAsync();


                if (blnAjoutVehicule)
                {
                    //Envoi mail demandeur
                    //bool blnRetMail = EnvoiMail("bertrand@hermess.fr;" + Usager.Email, "IDemat - Merci de votre confiance", "<body>Bonjour<br/>ça semble fonctionner :-)</body>");
                    string strRetMail = EnvoiMail(Variables.usageractif.Login, "IDemat - Merci de votre confiance", "<html dir='ltr' lang='en' class=''><charset='utf-8'><style type='text/css'>#messagebody div.rcmBody .ExternalClass {width: 100%}#messagebody div.rcmBody .ExternalClass, #messagebody div.rcmBody .ExternalClass p, #messagebody div.rcmBody .ExternalClass span, #messagebody div.rcmBody .ExternalClass font, #messagebody div.rcmBody .ExternalClass td, #messagebody div.rcmBody .ExternalClass div {line-height: 100%}#messagebody div.rcmBody {-webkit-text-size-adjust: none;-ms-text-size-adjust: none}#messagebody div.rcmBody {margin: 0;padding: 0}#messagebody div.rcmBody table td {border-collapse: collapse}#messagebody div.rcmBody p {margin: 0;padding: 0;margin-bottom: 0}#messagebody div.rcmBody h1, #messagebody div.rcmBody h2, #messagebody div.rcmBody h3, #messagebody div.rcmBody h4, #messagebody div.rcmBody h5, #messagebody div.rcmBody h6 {color: black;line-height: 100%}#messagebody div.rcmBody a, #messagebody div.rcmBody a:link {color: #2A5DB0;text-decoration: underline}#messagebody div.rcmBody,#messagebody div.rcmBody #body_style {font-size: 16px;font-family: Helvetica, Arial, sans-serif;color: #202020;background: #FAFAFA}#messagebody div.rcmBody span.yshortcuts {color: #202020;background-color: none;border: none}#messagebody div.rcmBody span.yshortcuts:hover,#messagebody div.rcmBody span.yshortcuts:active,#messagebody div.rcmBody span.yshortcuts:focus {color: #202020;background-color: none;border: none}#messagebody div.rcmBody a:visited {color: #3C96E2;text-decoration: none}#messagebody div.rcmBody a:focus {color: #3C96E2;text-decoration: underline}#messagebody div.rcmBody a:hover {color: #3C96E2;text-decoration: underline}@media only screen and (max-device-width: 599px) {#messagebody div.rcmBody div[id=body_style] {padding-bottom: 8px !important}#messagebody div.rcmBody table[class=w550],#messagebody div.rcmBody table[class=w600] {width: 100% !important}#messagebody div.rcmBody td[class=padding24] {padding-left: 16px !important;padding-right: 16px !important}#messagebody div.rcmBody td[class=heading] {padding-top: 24px !important; padding-bottom: 24px !important; padding-left: 16px !important; padding-right: 16px !important; font-size: 20px !important}#messagebody div.rcmBody td[class=headingBorder] {padding-bottom: 24px !important}#messagebody div.rcmBody td[class=maincontent] {padding-left: 16px !important;padding-right: 16px !important;padding-bottom: 32px !important}#messagebody div.rcmBody img[class=icon] {height: 150px !important}#messagebody div.rcmBody td[class=title] {font-size: 24px !important}#messagebody div.rcmBody td[class=introduction] {font-size: 18px !important}#messagebody div.rcmBody td[class=signature] {padding-top: 24px !important}}</style></head><body><div id='messagebody'><div class='message-htmlpart' style='background-color: #FAFAFA'><div class='rcmBody' style='line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><div id='body_style' style='padding-top: 8px; padding-bottom: 24px; padding-left: 8px; padding-right: 8px; line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><table class='w600' cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='600' align='center' style='width: 600px; line-height: 24px; border-radius: 20px'><tbody><tr><td class='maincontent' style='padding-top: 13px; padding-left: 72px; padding-right: 72px; padding-bottom: 72px'><table cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='100%' style='width: 100%; border-collapse: collapse'><tbody><tr><td align='center' style='padding-top: 0px; padding-bottom: 0px'><img class='icon' src='cid:pictomail' height='125' border='0' style='display: block; height: 125px; line-height: 54px; font-size: 40px; font-family: Helvetica,Arial,sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; color: #7795f8'></td></tr><tr><td class='introduction' style='padding-top: 27px; padding-bottom: 0px; line-height: 27px; font-size: 20px; text-align: center; font-weight: bold;color: #F48493'>Merci de votre confiance</td></tr><tr><td style='padding-top: 9px; padding-bottom: 12px; line-height: 30px; border-top: solid 0px #e9f1f6; border-bottom: solid 1px #e9f1f6'><br><br><span style='font-size: 18px; color: #272645'>Bonjour, <br>Votre demande d'ajout de véhicule a bien été reçue et sera traitée dans les meilleurs délais.<br>A bientôt,</span></td></tr><tr><td style='padding-top: 50px; padding-bottom: 0px; line-height: 19px; font-size: 16px; text-align: left; color: #272645'>Les équipes IDemat</td></tr></tbody></table></td></tr></tbody></table><table class='w600' cellpadding='0' cellspacing='0' border='0' width='600' align='center' style='width: 600px; line-height: 24px; border: 0'><tbody><tr><td align='center' style='padding-top: 13px; line-height: 14px; font-size: 12px; text-align: center; color: #bfc6d0'>Ce message est généré automatiquement, merci de ne pas y répondre.</td></tr></tbody></table></div></div></div></div></body></html>");

                    //Envoi mail exploitant
                    string strRetMailExpl = EnvoiMail(Variables.strMailNotificationDemandeWebApp, "IDbat - Une nouvelle demande d'ajout de véhicule est arrivée via IDemat", "<html dir = 'ltr' lang = 'en' class=''><charset='utf-8'><style type = 'text/css' >#messagebody div.rcmBody .ExternalClass {width: 100%}#messagebody div.rcmBody .ExternalClass, #messagebody div.rcmBody .ExternalClass p, #messagebody div.rcmBody .ExternalClass span, #messagebody div.rcmBody .ExternalClass font, #messagebody div.rcmBody .ExternalClass td, #messagebody div.rcmBody .ExternalClass div {line-height: 100%}#messagebody div.rcmBody {-webkit-text-size-adjust: none;-ms-text-size-adjust: none}#messagebody div.rcmBody {margin: 0;padding: 0}#messagebody div.rcmBody table td {border-collapse: collapse}#messagebody div.rcmBody p {margin: 0;padding: 0;margin-bottom: 0}#messagebody div.rcmBody h1, #messagebody div.rcmBody h2, #messagebody div.rcmBody h3, #messagebody div.rcmBody h4, #messagebody div.rcmBody h5, #messagebody div.rcmBody h6 {color: black;line-height: 100%}#messagebody div.rcmBody a, #messagebody div.rcmBody a:link {color: #2A5DB0;text-decoration: underline}#messagebody div.rcmBody,#messagebody div.rcmBody #body_style {font-size: 16px;font-family: Helvetica, Arial, sans-serif;color: #202020;background: #FAFAFA}#messagebody div.rcmBody span.yshortcuts {color: #202020;background-color: none;border: none}#messagebody div.rcmBody span.yshortcuts:hover,#messagebody div.rcmBody span.yshortcuts:active,#messagebody div.rcmBody span.yshortcuts:focus {color: #202020;background-color: none;border: none}#messagebody div.rcmBody a:visited {color: #3C96E2;text-decoration: none}#messagebody div.rcmBody a:focus {color: #3C96E2;text-decoration: underline}#messagebody div.rcmBody a:hover {color: #3C96E2;text-decoration: underline}@media only screen and (max-device-width: 599px) {#messagebody div.rcmBody div[id=body_style] {padding-bottom: 8px !important}#messagebody div.rcmBody table[class=w550],#messagebody div.rcmBody table[class=w600] {width: 100% !important}#messagebody div.rcmBody td[class=padding24] {padding-left: 16px !important;padding-right: 16px !important}#messagebody div.rcmBody td[class=heading] {padding-top: 24px !important; padding-bottom: 24px !important; padding-left: 16px !important; padding-right: 16px !important; font-size: 20px !important}#messagebody div.rcmBody td[class=headingBorder] {padding-bottom: 24px !important}#messagebody div.rcmBody td[class=maincontent] {padding-left: 16px !important;padding-right: 16px !important;padding-bottom: 32px !important}#messagebody div.rcmBody img[class=icon] {height: 150px !important}#messagebody div.rcmBody td[class=title] {font-size: 24px !important}#messagebody div.rcmBody td[class=introduction] {font-size: 18px !important}#messagebody div.rcmBody td[class=signature] {padding-top: 24px !important}}</style></head><body><div id='messagebody'><div class='message-htmlpart' style='background-color: #FAFAFA'><div class='rcmBody' style='line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><div id='body_style' style='padding-top: 8px; padding-bottom: 24px; padding-left: 8px; padding-right: 8px; line-height: 24px; font-size: 16px; font-family: Helvetica,Arial,sans-serif; color: #202020; background: #FAFAFA'><table class='w600' cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='600' align='center' style='width: 600px; line-height: 24px; border-radius: 20px'><tbody><tr><td class='maincontent' style='padding-top: 13px; padding-left: 72px; padding-right: 72px; padding-bottom: 72px'><table cellpadding='0' cellspacing='0' border='0' bgcolor='#FFFFFF' width='100%' style='width: 100%; border-collapse: collapse'><tbody><tr><td align='center' style='padding-top: 0px; padding-bottom: 0px'><img class='icon' src='cid:pictomail' height='125' border='0' style='display: block; height: 125px; line-height: 54px; font-size: 40px; font-family: Helvetica,Arial,sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; color: #7795f8'></td></tr><tr><td style='padding-top: 9px; padding-bottom: 12px; line-height: 30px; border-top: solid 0px #e9f1f6; border-bottom: solid 1px #e9f1f6'><br><br><span style='font-size: 18px; color: #272645'>Bonjour, <br>Connectez vous à IDbat pour la contrôler et la valider : <a href='" + _config.GetValue<string>("IDbat:URLIDbat") + "/lstValidationDemandesWA.aspx'>" + _config.GetValue<string>("IDbat:URLIDbat") + "/lstValidationDemandesWA.aspx</a></span></td></tr></tbody></table></td></tr></tbody></table><table class='w600' cellpadding='0' cellspacing='0' border='0' width='600' align='center' style='width: 600px; line-height: 24px; border: 0'><tbody><tr><td align='center' style='padding-top: 13px; line-height: 14px; font-size: 12px; text-align: center; color: #bfc6d0'>Ce message est généré automatiquement, merci de ne pas y répondre.</td></tr></tbody></table></div></div></div></div></body></html>");
                }

                return RedirectToPage("./InformationsPersonnelles", new { usagerGuid = Crypto.Crypte(guidUsager.ToString()), deconnect = false });
            }
            catch (Exception ex)
            {
                //return Redirect("https://pixabay.com/fr/images/search/" + ex.Message);
                return RedirectToPage("./Error", new { strMessage = ex.Message });
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

    }
}
