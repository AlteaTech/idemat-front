using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IDemat.Models
{
    [Table("TB_WA_ACHATPASSAGES")]
    public class AchatPassagesPayFip
    {
        [Key][Column("LNG_GUID")] public Guid Guid { get; set; }
        [Column("LNG_GUIDUSAGER")] public Guid GuidUsager { get; set; }
        [Column("STR_DATEACHAT")] public string DateAchat { get; set; }
        [Column("DT_DATEHEUREACHAT")] public DateTime DateHeureAchat { get; set; }
        [Column("STR_REFDET")] public string refdet { get; set; }
        [Column("DT_DATEHEUREINTERROGATION")] public DateTime? DateHeureInterrogation { get; set; }
        [Column("INT_NBPASSAGES")] public int NbPassages { get; set; }
        [Column("STR_PAYFIP_IDOP")] public string idop { get; set; }
        [Column("STR_PAYFIP_OBJET")] public string objet { get; set; }
        [Column("STR_PAYFIP_RESULTRANS")] public string resultrans { get; set; }
        [Column("STR_PAYFIP_DATTRANS")] public string dattrans { get; set; }
        [Column("STR_PAYFIP_HEURTRANS")] public string heurtrans { get; set; }
        [Column("STR_PAYFIP_NUMAUTO")] public string numauto { get; set; }

    }
}
