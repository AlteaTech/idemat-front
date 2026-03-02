using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_SEUIL")]
    public class Seuil
    {
        [Key][Column("LNG_GUID")] public Guid Guid { get; set; }
        [Column("LNG_IDENSEIGNE")] public int idEnseigne{ get; set; }
        [Column("STR_TYPESEUIL")] public string TypeSeuil { get; set; }
        [Column("STR_PERIODE")] public string Periode { get; set; }
        [Column("INT_NBPASSAGES")] public int? NbPassages { get; set; }     
    }
}
