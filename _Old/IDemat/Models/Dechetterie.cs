using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_REF_SITE")]
    public class Dechetterie
    {
        [Key][Column("LNG_ID")] public int Id { get; set; }
        [Column("LNG_IDENSEIGNE")] public int IdEnseigne { get; set; }
        [Column("STR_NOM")] public string Nom { get; set; }
        [Column("STR_ADRESSE1")] public string Adresse { get; set; }
        [Column("STR_CP")] public string CP { get; set; }
        [Column("STR_VILLE")] public string Ville { get; set; }
        [Column("BLN_OUVERTURE_LUNDI")] public bool Ouverturelundi { get; set; }
        [Column("STR_HEURE_OUVERTURE_LUNDI_AM")] public string Heureouverturelundiam { get; set; }
        [Column("STR_HEURE_FERMETURE_LUNDI_AM")] public string Heurefermeturelundiam { get; set; }
        [Column("STR_HEURE_OUVERTURE_LUNDI_PM")] public string Heureouverturelundipm { get; set; }
        [Column("STR_HEURE_FERMETURE_LUNDI_PM")] public string Heurefermeturelundipm { get; set; }
        [Column("BLN_OUVERTURE_MARDI")] public bool Ouverturemardi { get; set; }
        [Column("STR_HEURE_OUVERTURE_MARDI_AM")] public string Heureouverturemardiam { get; set; }
        [Column("STR_HEURE_FERMETURE_MARDI_AM")] public string Heurefermeturemardiam { get; set; }
        [Column("STR_HEURE_OUVERTURE_MARDI_PM")] public string Heureouverturemardipm { get; set; }
        [Column("STR_HEURE_FERMETURE_MARDI_PM")] public string Heurefermeturemardipm { get; set; }
        [Column("BLN_OUVERTURE_MERCREDI")] public bool Ouverturemercredi { get; set; }
        [Column("STR_HEURE_OUVERTURE_MERCREDI_AM")] public string Heureouverturemercrediam { get; set; }
        [Column("STR_HEURE_FERMETURE_MERCREDI_AM")] public string Heurefermeturemercrediam { get; set; }
        [Column("STR_HEURE_OUVERTURE_MERCREDI_PM")] public string Heureouverturemercredipm { get; set; }
        [Column("STR_HEURE_FERMETURE_MERCREDI_PM")] public string Heurefermeturemercredipm { get; set; }
        [Column("BLN_OUVERTURE_JEUDI")] public bool Ouverturejeudi { get; set; }
        [Column("STR_HEURE_OUVERTURE_JEUDI_AM")] public string Heureouverturejeudiam { get; set; }
        [Column("STR_HEURE_FERMETURE_JEUDI_AM")] public string Heurefermeturejeudiam { get; set; }
        [Column("STR_HEURE_OUVERTURE_JEUDI_PM")] public string Heureouverturejeudipm { get; set; }
        [Column("STR_HEURE_FERMETURE_JEUDI_PM")] public string Heurefermeturejeudipm { get; set; }
        [Column("BLN_OUVERTURE_VENDREDI")] public bool Ouverturevendredi { get; set; }
        [Column("STR_HEURE_OUVERTURE_VENDREDI_AM")] public string Heureouverturevendrediam { get; set; }
        [Column("STR_HEURE_FERMETURE_VENDREDI_AM")] public string Heurefermeturevendrediam { get; set; }
        [Column("STR_HEURE_OUVERTURE_VENDREDI_PM")] public string Heureouverturevendredipm { get; set; }
        [Column("STR_HEURE_FERMETURE_VENDREDI_PM")] public string Heurefermeturevendredipm { get; set; }
        [Column("BLN_OUVERTURE_SAMEDI")] public bool Ouverturesamedi { get; set; }
        [Column("STR_HEURE_OUVERTURE_SAMEDI_AM")] public string Heureouverturesamediam { get; set; }
        [Column("STR_HEURE_FERMETURE_SAMEDI_AM")] public string Heurefermeturesamediam { get; set; }
        [Column("STR_HEURE_OUVERTURE_SAMEDI_PM")] public string Heureouverturesamedipm { get; set; }
        [Column("STR_HEURE_FERMETURE_SAMEDI_PM")] public string Heurefermeturesamedipm { get; set; }
        [Column("BLN_OUVERTURE_DIMANCHE")] public bool Ouverturedimanche { get; set; }
        [Column("STR_HEURE_OUVERTURE_DIMANCHE_AM")] public string Heureouverturedimancheam { get; set; }
        [Column("STR_HEURE_FERMETURE_DIMANCHE_AM")] public string Heurefermeturedimancheam { get; set; }
        [Column("STR_HEURE_OUVERTURE_DIMANCHE_PM")] public string Heureouverturedimanchepm { get; set; }
        [Column("STR_HEURE_FERMETURE_DIMANCHE_PM")] public string Heurefermeturedimanchepm { get; set; }
        public string Heurelundiam
        {
            get
            {
                if (Ouverturelundi) { return Heureouverturelundiam.Substring(0, 2).Trim() + "h" + Heureouverturelundiam.Substring(2, 2).Trim() + "-" + Heurefermeturelundiam.Substring(0, 2).Trim() + "h" + Heurefermeturelundiam.Substring(2, 2).Trim(); } else { return "Fermé";  }
                
            }
        }
        public string Heurelundipm
        {
            get
            {
                if (Ouverturelundi) { return Heureouverturelundipm.Substring(0, 2).Trim() + "h" + Heureouverturelundipm.Substring(2, 2).Trim() + "-" + Heurefermeturelundipm.Substring(0, 2).Trim() + "h" + Heurefermeturelundipm.Substring(2, 2).Trim(); } else { return ""; }
            }
        }
        public string Heuremardiam
        {
            get
            {
                if (Ouverturemardi) { return Heureouverturemardiam.Substring(0, 2).Trim() + "h" + Heureouverturemardiam.Substring(2, 2).Trim() + "-" + Heurefermeturemardiam.Substring(0, 2).Trim() + "h" + Heurefermeturemardiam.Substring(2, 2).Trim(); } else { return "Fermé"; }

            }
        }
        public string Heuremardipm
        {
            get
            {
                if (Ouverturemardi) { return Heureouverturemardipm.Substring(0, 2).Trim() + "h" + Heureouverturemardipm.Substring(2, 2).Trim() + "-" + Heurefermeturemardipm.Substring(0, 2).Trim() + "h" + Heurefermeturemardipm.Substring(2, 2).Trim(); } else { return ""; }
            }
        }
        public string Heuremercrediam
        {
            get
            {
                if (Ouverturemercredi) { return Heureouverturemercrediam.Substring(0, 2).Trim() + "h" + Heureouverturemercrediam.Substring(2, 2).Trim() + "-" + Heurefermeturemercrediam.Substring(0, 2).Trim() + "h" + Heurefermeturemercrediam.Substring(2, 2).Trim(); } else { return "Fermé"; }

            }
        }
        public string Heuremercredipm
        {
            get
            {
                if (Ouverturemercredi) { return Heureouverturemercredipm.Substring(0, 2).Trim() + "h" + Heureouverturemercredipm.Substring(2, 2).Trim() + "-" + Heurefermeturemercredipm.Substring(0, 2).Trim() + "h" + Heurefermeturemercredipm.Substring(2, 2).Trim(); } else { return ""; }
            }
        }
        public string Heurejeudiam
        {
            get
            {
                if (Ouverturejeudi) { return Heureouverturejeudiam.Substring(0, 2).Trim() + "h" + Heureouverturejeudiam.Substring(2, 2).Trim() + "-" + Heurefermeturejeudiam.Substring(0, 2).Trim() + "h" + Heurefermeturejeudiam.Substring(2, 2).Trim(); } else { return "Fermé"; }

            }
        }
        public string Heurejeudipm
        {
            get
            {
                if (Ouverturejeudi) { return Heureouverturejeudipm.Substring(0, 2).Trim() + "h" + Heureouverturejeudipm.Substring(2, 2).Trim() + "-" + Heurefermeturejeudipm.Substring(0, 2).Trim() + "h" + Heurefermeturejeudipm.Substring(2, 2).Trim(); } else { return ""; }
            }
        }
        public string Heurevendrediam
        {
            get
            {
                if (Ouverturevendredi) { return Heureouverturevendrediam.Substring(0, 2).Trim().Trim() + "h" + Heureouverturevendrediam.Substring(2, 2).Trim() + "-" + Heurefermeturevendrediam.Substring(0, 2).Trim().Trim() + "h" + Heurefermeturevendrediam.Substring(2, 2).Trim(); } else { return "Fermé"; }

            }
        }
        public string Heurevendredipm
        {
            get
            {
                if (Ouverturevendredi) { return Heureouverturevendredipm.Substring(0, 2).Trim().Trim() + "h" + Heureouverturevendredipm.Substring(2, 2).Trim() + "-" + Heurefermeturevendredipm.Substring(0, 2).Trim().Trim() + "h" + Heurefermeturevendredipm.Substring(2, 2).Trim(); } else { return ""; }
            }
        }
        public string Heuresamediam
        {
            get
            {
                if (Ouverturesamedi) { return Heureouverturesamediam.Substring(0, 2).Trim() + "h" + Heureouverturesamediam.Substring(2, 2).Trim() + "-" + Heurefermeturesamediam.Substring(0, 2).Trim() + "h" + Heurefermeturesamediam.Substring(2, 2).Trim(); } else { return "Fermé"; }

            }
        }
        public string Heuresamedipm
        {
            get
            {
                if (Ouverturesamedi) { return Heureouverturesamedipm.Substring(0, 2).Trim() + "h" + Heureouverturesamedipm.Substring(2, 2).Trim() + "-" + Heurefermeturesamedipm.Substring(0, 2).Trim() + "h" + Heurefermeturesamedipm.Substring(2, 2).Trim(); } else { return ""; }
            }
        }
        public string Heuredimancheam
        {
            get
            {
                if (Ouverturedimanche) { return Heureouverturedimancheam.Substring(0, 2).Trim() + "h" + Heureouverturedimancheam.Substring(2, 2).Trim() + "-" + Heurefermeturedimancheam.Substring(0, 2).Trim() + "h" + Heurefermeturedimancheam.Substring(2, 2).Trim(); } else { return "Fermé"; }

            }
        }
        public string Heuredimanchepm
        {
            get
            {
                if (Ouverturedimanche) { return Heureouverturedimanchepm.Substring(0, 2).Trim() + "h" + Heureouverturedimanchepm.Substring(2, 2).Trim() + "-" + Heurefermeturedimanchepm.Substring(0, 2).Trim() + "h" + Heurefermeturedimanchepm.Substring(2, 2).Trim(); } else { return ""; }
            }
        }
    }
}
