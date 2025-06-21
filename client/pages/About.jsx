import React from "react";
import { Link } from "react-router-dom";
import logoWhite from "../src/assets/images/lande_white.png";
import Footer from "../src/components/Footer";

export default function About() {
  return (
    <>
      <header className="p-8" />
      <div className="min-h-screen flex flex-col items-center justify-start px-32 gap-10">
        <Link to="/">
        <img src={logoWhite} className="w-52 h-52 mb-12" alt="lande" />
      </Link>
        <div className="flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-2xl p-6 rounded-md shadow-md">
          <p className="indent-8 mb-4">
            Fitofarmacia L&E AGROTEAM SRL este partenerul de încredere al
            tuturor celor pasionați de agricultură, fie că este vorba despre
            fermieri profesioniști sau grădinari hobby. Comercializăm o gamă
            variată de produse fitosanitare, semințe, îngrășăminte și accesorii
            de la furnizori de renume internațional, precum: Bayer, Syngenta,
            BASF, Adama, Nufarm, Summit Agro și Arysta. Toate produsele noastre
            sunt testate direct în teren de către echipa noastră, pentru a
            garanta eficiența și calitatea tratamentelor recomandate.
          </p>

          <p className="indent-8 mb-4">
            Misiunea noastră este să oferim clienților soluții eficiente și
            sigure pentru protecția plantelor, contribuind astfel la obținerea
            unor recolte sănătoase și bogate. Punem un accent deosebit pe
            consilierea personalizată – echipa noastră de specialiști oferă
            consultanță gratuită adaptată fiecărei nevoi, indiferent de
            dimensiunea exploatației agricole. De asemenea, suntem mereu
            disponibili pentru a răspunde întrebărilor, a oferi sugestii de
            tratamente și a ajuta la identificarea celor mai potrivite produse
            pentru fiecare cultură în parte.
          </p>

          <p className="indent-8 mb-4">
            Ne menținem la curent cu cele mai noi soluții din domeniul
            protecției plantelor și le introducem rapid în oferta noastră pentru
            a ține pasul cu cerințele tot mai ridicate ale agriculturii moderne.
            Adaptabilitatea și inovația fac parte din valorile noastre
            fundamentale. Indiferent dacă aveți o livadă, o grădină mică sau o
            exploatație agricolă de mari dimensiuni, la noi veți găsi produse
            eficiente, testate și omologate, precum și o echipă care vă va
            sprijini cu seriozitate și profesionalism.
          </p>

          <p className="indent-8">
            Vă mulțumim că ne-ați ales și vă invităm să descoperiți întreg
            portofoliul nostru de produse și servicii disponibile atât online,
            cât și în punctul nostru fizic de lucru. Prin intermediul
            webshopului nostru, dorim să facem accesul la produse profesionale
            mai rapid și mai convenabil, oferind livrare promptă, informații
            clare și suport tehnic constant. Împreună, putem contribui la o
            agricultură sustenabilă, eficientă și profitabilă.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
