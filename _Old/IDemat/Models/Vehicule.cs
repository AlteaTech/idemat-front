using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace IDemat.Models
{
    public class Vehicule
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "L'immatriculation est obligatoire")] public string Immatriculation { get; set; }
        public DemandeUsager Product { get; set; }
    }
}