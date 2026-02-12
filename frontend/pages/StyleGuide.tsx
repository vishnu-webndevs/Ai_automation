import React from 'react';

const StyleGuide: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
          Style Guide
        </h1>
        <p className="text-xl text-slate-400">
          Design system reference for developers and designers.
        </p>
      </div>

      <div className="space-y-20">
        
        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Colors</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-slate-300 mb-4">Primary Brand Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { name: 'Purple 500', class: 'bg-purple-500' },
                    { name: 'Purple 600', class: 'bg-purple-600' },
                    { name: 'Blue 500', class: 'bg-blue-500' },
                    { name: 'Slate 950', class: 'bg-slate-950' }
                ].map((color, i) => (
                    <div key={i} className="space-y-2">
                        <div className={`h-20 rounded-lg shadow-lg ${color.class}`}></div>
                        <p className="text-sm text-slate-400">{color.name}</p>
                    </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-slate-300 mb-4">Neutrals</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[50, 100, 300, 500, 700, 900].map((val) => (
                    <div key={val} className="space-y-2">
                        <div className={`h-16 rounded-lg shadow-lg bg-slate-${val}`}></div>
                        <p className="text-sm text-slate-400">Slate {val}</p>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Typography</h2>
          <div className="space-y-8 bg-slate-900/50 p-8 rounded-xl border border-white/5">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">Heading 1</h1>
              <p className="text-slate-500 text-sm">text-5xl font-bold</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">Heading 2</h2>
              <p className="text-slate-500 text-sm">text-4xl font-bold</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">Heading 3</h3>
              <p className="text-slate-500 text-sm">text-3xl font-bold</p>
            </div>
            <div>
              <p className="text-xl text-slate-300 mb-2">Body Large - The quick brown fox jumps over the lazy dog.</p>
              <p className="text-slate-500 text-sm">text-xl</p>
            </div>
            <div>
              <p className="text-base text-slate-300 mb-2">Body Regular - The quick brown fox jumps over the lazy dog.</p>
              <p className="text-slate-500 text-sm">text-base</p>
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">Body Small - The quick brown fox jumps over the lazy dog.</p>
              <p className="text-slate-500 text-sm">text-sm</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Components</h2>
          <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-slate-300 mb-6">Buttons</h3>
                <div className="flex flex-wrap gap-4 items-center">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full transition-colors font-medium">
                        Primary Button
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-full transition-colors font-medium">
                        Secondary Button
                    </button>
                    <button className="text-slate-300 hover:text-white px-6 py-2.5 font-medium">
                        Text Button
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-slate-300 mb-6">Form Elements</h3>
                <div className="max-w-md space-y-4">
                    <input 
                        type="text" 
                        placeholder="Input Field" 
                        className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500" defaultChecked />
                        <span className="text-slate-300">Checkbox Option</span>
                    </div>
                </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default StyleGuide;
