using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_LISTENOIRE")]
    public class ListeNoire
    {
        [Key][Column("LNG_ID")] public int Id { get; set; }
        [Column("LNG_GUIDCARTEUSAGER")] public Guid GuidUsager { get; set; }
        [Column("LNG_IDPERTEVOL")] public int IDMotifListeNoire { get; set; }
        [Column("STR_DATECREATION")] public string DateCreation { get; set; }
        [Column("STR_HEURECREATION")] public string HeureCreation { get; set; }
    }
}
