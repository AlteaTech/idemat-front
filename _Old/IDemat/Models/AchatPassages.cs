using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_ACHATPASSAGES")]
    public class AchatPassages
    {
        [Key][Column("LNG_GUID")] public Guid Guid { get; set; }
        [Column("LNG_GUIDUSAGER")] public Guid GuidUsager { get; set; }
        [Column("STR_DATEACHAT")] public string DateAchat { get; set; }
        [Column("INT_NBPASSAGES")] public int NbPassages { get; set; }
        public string DateAchatFormattee
        {
            get
            {
               return DateAchat.Substring(6, 2).Trim() + "/" + DateAchat.Substring(4, 2).Trim() + "/" + DateAchat.Substring(0, 4).Trim();
                
            }
        }        
    }
}
