using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using IDemat.Models;

namespace IDemat.Data
{
    public class IDematContext : DbContext
    {
        public IDematContext (DbContextOptions<IDematContext> options)
            : base(options)
        {
        }
        
        public DbSet<IDemat.Models.DemandeUsager> DemandesUsagers { get; set; }
        public DbSet<IDemat.Models.DemandeAjoutVehicule> DemandesAjoutsVehicules{ get; set; }
        public DbSet<IDemat.Models.Vehicule> Vehicule { get; set; }
        public DbSet<IDemat.Models.Contrat> Contrats { get; set; }
        public DbSet<IDemat.Models.Dechetterie> Dechetteries { get; set; }
        public DbSet<IDemat.Models.Usager> Usagers { get; set; }
        public DbSet<IDemat.Models.UsagerQRCode> UsagersQRCode { get; set; }
        public DbSet<IDemat.Models.UsagerImmat> UsagersImmats { get; set; }
        public DbSet<IDemat.Models.UsagerNbPassagesAnnee> UsagerNbPassagesAnnee { get; set; }
        public DbSet<IDemat.Models.Frequentation> Frequentations { get; set; }
        public DbSet<IDemat.Models.ListeNoire> ListesNoires { get; set; }
        public DbSet<IDemat.Models.RefListeNoire> RefsListesNoires { get; set; }
        public DbSet<IDemat.Models.AchatPassages> AchatsPassages { get; set; }
        public DbSet<IDemat.Models.AchatPassagesPayFip> AchatsPassagesPayFip { get; set; }
        public DbSet<IDemat.Models.Seuil> Seuils { get; set; }
        public DbSet<IDemat.Models.RefCommune> RefsCommunes { get; set; }


    }
}
