import React from 'react';
import { GraduationCap, Store, Zap } from 'lucide-react';

export const HowItWorks = () => {
  const useCases = [
    {
      icon: GraduationCap,
      title: 'Laburos de Campus',
      description: 'Ayuda a otros estudiantes con tutorías, transcripciones, llenado de encuestas o asesorías rápidas.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      icon: Store,
      title: 'Apoyo en Locales',
      description: 'Cubre horas punta en cafeterías, librerías o minimarkets cercanos a la universidad.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100'
    },
    {
      icon: Zap,
      title: 'Micro-servicios',
      description: 'Tareas súper rápidas como ir a buscar un pedido pesado, configurar un software o armado de cajas.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    }
  ];

  return (
    <section className="bg-white border-t border-slate-100 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            ¿Qué puedes hacer en tus ventanas?
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Descubre los casos de uso más populares diseñados para la rapidez, informalidad segura y la comunidad local.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div 
                key={index} 
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${useCase.bgColor} ${useCase.borderColor} ${useCase.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{useCase.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
