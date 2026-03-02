using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    //[Table("V_WA_USAGERQR")] //TB_USAGER
    [Table("TB_USAGER")] 
    public class Usager
    {
        [Key] [Column("LNG_GUID")] public Guid GuidUsager { get; set; }
        [Column("LNG_IDENSEIGNE")] public int IdEnseigne { get; set; }
        [Required(ErrorMessage = "Le login est obligatoire")] [MaxLength(100)] [Column("STR_EMAIL")] [Display(Name = "Login", Prompt = "Login")] public string? Login { get; set; }
        [DataType(DataType.Password)] [MaxLength(50)] [Column("STR_MOTDEPASSE")] [Display(Name = "Mot de passe", Prompt = "Mot de passe")] public string Motdepasse { get; set; }
        [Column("BLN_MOTDEPASSECHANGE")] public bool MotdepasseChange { get; set; }
        //[Column("STR_QRCODE")] public string CB { get; set; }
        [Column("STR_NOM")] public string Nom { get; set; }
        [Column("LNG_REFCLIENTIDBAT")] public int RefClientIdbat { get; set; }
        [Column("STR_ADRESSE1")] public string Adresse { get; set; }
        [Column("STR_CP")] public string CP { get; set; }
        [Column("STR_VILLE")] public string Ville { get; set; }
        [Column("STR_TELM")] public string Telephone { get; set; }
        [Column("STR_IMMATRICULATIONS")] public string strImmatriculations { get; set; }
        [Column("STR_CIVILITE")] public string Civilite { get; set; }
        //public string CiviliteFormattee
        //{
        //    get
        //    {
        //        return Civilite.Trim() == "M" ? "M." : Civilite.Trim();
        //    }
        //}

    }

    [Table("V_WA_USAGERQR")] 
    public class UsagerQRCode
    {
        [Key] [Column("LNG_GUID")] public Guid GuidUsager { get; set; }
        [Column("LNG_IDENSEIGNE")] public int IdEnseigne { get; set; }
        [Column("STR_QRCODE")] public string CB { get; set; }
        [Column("STR_NOM")] public string Nom { get; set; }
        [Column("STR_ADRESSE1")] public string Adresse { get; set; }
        [Column("STR_CP")] public string CP { get; set; }
        [Column("STR_VILLE")] public string Ville { get; set; }
        [Column("STR_TELM")] public string Telephone { get; set; }
        //[Column("STR_IMMATRICULATIONS")] public string strImmatriculations { get; set; }
    }

    [Table("V_WA_USAGERIMMATS")]
    public class UsagerImmat
    {
        [Key] [Column("LNG_GUID")] public Guid GuidUsager { get; set; }
        [Column("LNG_IDENSEIGNE")] public int IdEnseigne { get; set; }
        [Column("STR_IMMAT")] public string Immat { get; set; }
    }

    [Table("V_WA_USAGERPASSAGESANNEE")]
    public class UsagerNbPassagesAnnee
    {
        [Key] [Column("LNG_GUIDUSAGER")] public Guid GuidUsager { get; set; }
        [Column("NBDEPOT")] public int NbPassages { get; set; }
    }
}
