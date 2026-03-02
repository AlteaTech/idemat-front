using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using IDemat.Models;
using srPayFip;

namespace IDemat.Global
{
    [Keyless]
    public class Listes
    {
        public string[] Civilites = new[] { "M", "Mme" };
        public string[] TypesCarte = new[] { "Carte physique", "Carte dématérialisée" };  
    }

    [Keyless]
    public class Variables
    {
        public bool erreurCivilite = false;
        public bool erreurNom = false;
        public bool erreurPrenom = false;
        public bool erreurSociete = false;
        public bool erreurSIRET = false;
        public bool erreurAdresse = false;
        //public bool erreurCodePostal = false;
        public bool erreurVille = false;
        public bool erreurMail = false;
        public bool erreurTelephone = false;
        public bool erreurTypeCarte = false;
        public bool erreurCI = false;
        public bool erreurJD = false;
        public bool erreurCG = false;
        public bool erreurKB = false;
        public bool erreurMentionsLegales = false;
        public bool erreurUniciteEmail = false;
        public string erreurEmail = "";
        public bool erreurImmat = false;
        public bool erreurF3 = false;
        public string erreurDebug = "";
        public bool erreurLogin = false;
        public bool erreurMotdepasse = false;
        public bool erreurCompteSupprime = false;
        public bool erreurMotdepasseComplexite = false;
        public bool erreurMotdepasseConfirmation = false;
        //public string callingURL = "";
        public string strImmatriculations = "";
        public string strImmatriculationsAnciennes = "";
        public Guid guidCreation;

        public int idEnseigne = -1;
        public bool blnImmatriculations = false;
        public bool blnImmatriculationsPros = false;
        public bool blnCarteDemat = false;
        public bool blnCartePhysique = false;
        public string strMailNotificationDemandeWebApp = "";
        public string strMentionsLegales = "";
        public string strPartOuPro = "";
        public bool blnDemandeZoneJ1F3 = false;

        public Guid guidUsager;
        public string nomUsager = "";
        public string civiliteUsager = "";
        public string nomContrat = "";
        public string urlContrat = "";
        public bool blnPossibiliteAchatPassages = false;
        public int nbPassagesSeuilAnnee = 0;
        public int nbPassagesAchetesAnnee = 0;
        public int? nbPassagesAchetables = 0;
        public string montantAchatPassages= "";
        public int montantAchatPassagesCentimes = 0;
        //public int nbPassagesAnnee;

        public string messageBienvenue = "";
        public string qrCodeUri = "";

        public Usager usageractif;
        public UsagerQRCode usagerqrcodeactif;
        public UsagerNbPassagesAnnee usagernbpassagesanneeactif;

        public int idDechetterie = -1;
        public Dechetterie dechetterieactive;

        public string strURLLogo = "";

        public string idOp = "";
        public string texteRetourPayfip = "";
        public RecupererDetailPaiementSecuriseResponse detailPaiement;

    }
}
