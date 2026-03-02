using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_WA_USAGERS")]
    public class DemandeUsager
    {
        [Key][Column("LNG_GUID")] public Guid GuidUsager { get; set; }
        [Column("STR_CIVILITE")] [Display(Name = "Civilité")] public string Civilite { get; set; }
        //public string[] Civilites = new[] { "M.", "Mme" };
        [MaxLength(50)] [NotMapped] [Display(Name = "Nom", Prompt = "Ex : DUPONT")] public string Nom { get; set; }
        [MaxLength(50)] [NotMapped] [Display(Name = "Prénom", Prompt = "Ex : Julie")] public string Prenom { get; set; }
        [MaxLength(101)] [Column("STR_NOMPRENOM")] [Display(Name = "Prénom", Prompt = "Ex : Julie")] public string NomPrenom { get; set; }
        [MaxLength(50)] [Column("STR_SOCIETE")] [Display(Name = "Société", Prompt = "Ex : Ets Dupont")] public string Societe { get; set; }
        [MaxLength(14)] [Column("STR_SIRET")] [Display(Name = "SIRET", Prompt = "Ex : 12345678901234")] public string SIRET { get; set; }
        [DataType(DataType.PhoneNumber)] [MaxLength(50)] [Column("STR_TELM")] [Display(Name = "Téléphone", Prompt = "Ex : 06.00.00.00.00")] public string Telephone { get; set; }
        [MaxLength(35)] [Column("STR_ADRESSE1")] [Display(Name = "Adresse", Prompt = "Ex : 1 rue Sésame")] public string Adresse { get; set; }
        [DataType(DataType.PostalCode)] [MaxLength(5)] [Column("STR_CP")] [Display(Name = "Code postal", Prompt = "EX : 75000")] public string CP { get; set; }
        [MaxLength(35)] [Column("STR_VILLE")] [Display(Name = "Ville", Prompt = "Ex : Paris")] public string Ville { get; set; }
        [DataType(DataType.EmailAddress, ErrorMessage = "L'adresse email n'est pas valide")] [MaxLength(100)] [Column("STR_EMAIL")] [Display(Name = "Email", Prompt = "Ex : adresse@mail.com")] public string Email { get; set; }
        [Column("STR_TYPECARTE")] [Display(Name = "Carte d'accès en déchetterie")] public string TypeCarte { get; set; }
        [Column("STR_IMMATRICULATIONS")] public string strImmatriculations { get; set; }
        [Required][Column("LNG_IDENSEIGNE")] public int IdEnseigne { get; set; }
        [NotMapped] [Display(Name = "Immatriculation du véhicule", Prompt = "Ex : AA-123-AA")] public string ImmatEnCours { get; set; }
        [NotMapped] [Display(Name = "Zone J.1 de la carte grise", Prompt = "Ex : VP")] public string ImmatJ1EnCours { get; set; }
        [NotMapped] [Display(Name = "Zone F.3 de la carte grise", Prompt = "Ex : 1690")] public string ImmatF3EnCours { get; set; }
        [NotMapped] public string strPartOuPro { get; set; }
        [NotMapped] public string CPVille { get; set; }
        //public string CPVille
        //{
        //    get
        //    {
        //        return CP + " " + Ville;
        //    }
        //}

        //public string[] TypesCarte = new[] { "Carte physique", "Carte dématérialisée" };
        //[Column(TypeName = "decimal(18,2)")] public decimal Price { get; set; }
        //[MaxLength(15, ErrorMessage = "Trop long")] public string Detail { get; set; }
        //public ICollection<Vehicule> Vehicules { get; } = new List<Vehicule>();
        //[NotMapped] public List<string> Immatriculations => strImmatriculations.Split(";").ToList();
    }
}
