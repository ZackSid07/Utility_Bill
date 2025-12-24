import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { BillDetails } from '../types';

interface GeminiProps {
    billDetails: BillDetails | null;
}

const Gemini: React.FC<GeminiProps> = ({ billDetails }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt || !billDetails) {
            setError('Please enter a prompt and calculate a bill first.');
            return;
        }

        setError('');
        setLoading(true);
        setResponse('');
        setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const fullPrompt = `Based on the following utility bill data, please answer the user's question.
            
            Bill Data:
            - Units Consumed: ${billDetails.units.toFixed(2)}
            - Subtotal: $${billDetails.subtotal.toFixed(2)}
            - VAT Amount: $${billDetails.vatAmount.toFixed(2)}
            - Service Charge: $${billDetails.serviceCharge.toFixed(2)}
            - Total Payable: $${billDetails.total.toFixed(2)}

            User's Question: "${prompt}"
            `;
            
            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: fullPrompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const text = result.text;
            if (text) {
                setResponse(text);
            } else {
                setError('Received an empty response from the model.');
            }
            
            const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks) {
                const webSources = groundingChunks
                    .map((chunk: any) => chunk.web)
                    .filter(Boolean); // Filter out any non-web chunks
                setSources(webSources);
            }

        } catch (e: any) {
            console.error('Gemini API call failed', e);
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-center text-white mb-4">Ask Gemini About Your Bill</h3>
            <p className="text-center text-gray-400 mb-6">
                Get insights, comparisons, or savings tips related to your calculated bill.
            </p>
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Is this total high for a single-person household? or How can I reduce my consumption?"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    disabled={loading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {loading ? 'Generating...' : 'Generate Insights'}
                </button>
            </div>

            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

            {response && (
                <div className="mt-6 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                    <h4 className="text-xl font-semibold text-white mb-4">Gemini's Response:</h4>
                    <div className="prose prose-invert max-w-none text-gray-300">
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
                    </div>
                   
                    {sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-600">
                            <h5 className="font-semibold text-gray-200 mb-2">Sources:</h5>
                            <ul className="list-disc list-inside space-y-1">
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a 
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-indigo-400 hover:underline"
                                        >
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Gemini;