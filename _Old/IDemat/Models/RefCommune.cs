using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_REF_ENSEIGNECOMMUNE")]
    public class RefCommune
    {
        [Key] [Column("LNG_ID")] public int IdCommune { get; set; }
        [Column("LNG_IDENSEIGNE")] public int IdEnseigne { get; set; }
        [Column("STR_CP")] public string CP { get; set; }
        [Column("STR_VILLE")] public string Ville { get; set; }
        public string CPVille
        {
            get
            {
                return CP + " " + Ville;
            }
        }
    }
}
