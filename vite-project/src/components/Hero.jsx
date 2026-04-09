// import React, { useState, useEffect } from "react";
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "../firebase";

// export default function Hero() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onSnapshot(
//       collection(db, "heroSection"),
//       (snapshot) => {
//         const doc = snapshot.docs[0];
//         if (doc) setData(doc.data());
//       },
//       (error) => console.error("Error fetching hero section:", error)
//     );

//     return () => unsubscribe();
//   }, []);

//   if (!data) return null;

//   return (
//     <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
    
//       <video
//         src={data.video}
//         autoPlay
//         loop
//         muted
//         playsInline
//         className="absolute top-0 left-0 w-full h-full object-cover z-0"
//       />

//       {/* Overlay - მუქი ფენა ტექსტის უკეთ წასაკითხად */}
//       <div className="absolute inset-0 bg-black/40 z-10"></div>

      

//       <style>
//         {`
//         @keyframes fadeIn {
//           0% { opacity: 0; transform: translateY(30px); }
//           100% { opacity: 1; transform: translateY(0); }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 1.5s ease-out forwards;
//         }
//         `}
//       </style>
//     </section>
//   );
// }

import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function Hero() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "heroSection"),
      (snapshot) => {
        if (!snapshot.empty) {
          setData(snapshot.docs[0].data());
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching hero section:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen bg-black" />; // დროებითი შავი ფონი

  return (
    <section className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden bg-black">
      {/* ვიდეო ელემენტი */}
      {data?.video && (
        <video
          src={data.video}
          poster={data.posterUrl} // სურათი ვიდეოს ჩატვირთვამდე
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover object-center z-0 scale-105" 
          /* scale-105 ეხმარება "თეთრი ხაზების" აცილებაში კიდეებზე */
        />
      )}

      {/* Overlay - გრადიენტი უფრო ეფექტურია ვიდრე უბრალო მუქი ფენა */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />

      {/* კონტენტი (ტექსტი) */}
      
        
      
    </section>
  );
}