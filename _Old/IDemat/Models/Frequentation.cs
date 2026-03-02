using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_WA_FREQUENTATIONSITES")]
    public class Frequentation
    {
        [Key] [Column("LNG_ID")] public Guid guidUsager { get; set; }
        [Column("LNG_IDSITE")] public int IDSite { get; set; }
        [Column("STR_JOUR")] public string Jour { get; set; }
        [Column("INT_HEURE")] public int Heure { get; set; }
        [Column("INT_FREQUENTATION")] public int NbPassages { get; set; }
    }
}
