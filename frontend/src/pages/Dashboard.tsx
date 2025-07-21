import React, { useState } from 'react';

const Dashboard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = 'http://127.0.0.1:8000/api/';
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysis(null);
      setGeneratedImages([]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log('working');
    
    try {
      const res = await fetch(`${API_URL}images/analyze`, {
        method: 'POST',
        body: formData,
      });
      console.log(res);
      
      if (!res.ok) throw new Error('Image analysis failed');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!analysis) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analysis }),
      });
      if (!res.ok) throw new Error('Image generation failed');
      const data = await res.json();
      // If backend returns multiple images, adjust accordingly
      console.log('Generated images:', data.generated_image.data);
      
      const images = data.generated_image.data;
      setGeneratedImages(images);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        onSubmit={handleAnalyze}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Image Processor</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading || !selectedFile}
        >
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </form>
      {
        loading && <div className="mt-4 text-blue-500">Loading...</div>
      }
      {analysis && (
        <div className="mt-8 w-full max-w-md bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-center">Analysis Result</h3>
          <p className="mb-4">{analysis}</p>
          <button
            onClick={handleGenerate}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      )}
      {generatedImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-center">Generated Images</h3>
          <div className="flex flex-wrap gap-4 justify-center">
                {generatedImages.map((img, idx) => {
                  console.log(`Image ${idx + 1}:`, img);
            return (
                <img key={idx} src={img} alt={`Generated ${idx + 1}`} className="max-w-md rounded shadow" />
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;