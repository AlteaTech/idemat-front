using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_REF_PERTEVOL")]
    public class RefListeNoire
    {
        [Key] [Column("LNG_ID")] public int IdMotifPerteVol { get; set; }
        [Column("STR_LIBELLE")] public string Libelle { get; set; }
    }
}
