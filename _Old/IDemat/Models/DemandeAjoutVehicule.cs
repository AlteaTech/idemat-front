using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_WA_AJOUTVEHICULES")]
    public class DemandeAjoutVehicule
    {
        [Key] [Column("LNG_ID")] public int Id { get; set; }
        [Column("LNG_GUIDUSAGER")] public Guid guidUsager { get; set; }
        [Column("STR_IMMATRICULATIONS")] public string strImmatriculations { get; set; }
        [NotMapped] [Display(Name = "Immatriculation du véhicule", Prompt = "Immatriculation du véhicule")] public string ImmatEnCours { get; set; }
        [NotMapped] [Display(Name = "Zone J.1 de la carte grise", Prompt = "Ex : VP")] public string ImmatJ1EnCours { get; set; }
        [NotMapped] [Display(Name = "Zone F.3 de la carte grise", Prompt = "Ex : 1690")] public string ImmatF3EnCours { get; set; }

        [NotMapped] [Display(Name = "Immatriculation du véhicule", Prompt = "Immatriculation du véhicule")] public string ImmatASupprimer { get; set; }
    }
}
