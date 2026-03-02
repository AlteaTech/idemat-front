using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_REF_ENSEIGNE")]
    public class Contrat
    {
        [Key][Column("LNG_ID")] public int Id { get; set; }
        [Column("STR_WEBAPP_URL")] public string URL { get; set; }
        [Column("STR_NOM")] public string Nom { get; set; }
        [Column("STR_TRIGRAMME")] public string Trigramme { get; set; }
        [Column("BLN_WEBAPP_IMMATRICULATIONS")] public bool EnseigneImmatriculations { get; set; }
        [Column("BLN_WEBAPP_IMMATRICULATIONS_PROS")] public bool EnseigneImmatriculationsPros { get; set; }
        [Column("BLN_WEBAPP_CARTEDEMATERIALISEE")] public bool EnseigneCarteDemat { get; set; }
        [Column("BLN_WEBAPP_CARTEPHYSIQUE")] public bool EnseigneCartePhysique { get; set; }
        [Column("STR_MAIL_NOTIFICATIONDEMANDEWEBAPP")] public string MailNotificationDemandeWebApp { get; set; }
        [Column("STR_MENTIONSLEGALESWEBAPP")] public string MentionsLegales { get; set; }
        [Column("INT_PASSAGESACHETABLES")] public int? NbPassagesAchetables { get; set; }
        [Column("DEC_COUTPASSAGESUPPLEMENTAIRE")] public decimal? CoutPassageSupplementaire { get; set; }
        [Column("STR_PAYFIPNUMCLI")] public string PayfipNumCli { get; set; }
        [Column("STR_PAYFIPSAISIE")] public string PayfipSaisie { get; set; }
        [Column("BLN_DEMANDEZONEJ1F3_CARTEGRISE")] public bool DemandeZoneJ1F3 {get;set;}
        
    }
}
