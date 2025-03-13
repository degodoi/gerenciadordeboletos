
// Local storage keys
const BOLETOS_STORAGE_KEY = 'cfc-direcao-boletos';

// Save boletos to local storage
export const saveBoletos = (boletos: any[]) => {
  try {
    // Ensure dates are properly serialized
    const boletosToSave = boletos.map(boleto => ({
      ...boleto,
      parcelasInfo: boleto.parcelasInfo.map((parcela: any) => ({
        ...parcela,
        // Ensure dataVencimento is a Date object before converting to ISO string
        dataVencimento: parcela.dataVencimento instanceof Date 
          ? parcela.dataVencimento 
          : new Date(parcela.dataVencimento)
      }))
    }));
    
    localStorage.setItem(BOLETOS_STORAGE_KEY, JSON.stringify(boletosToSave));
    console.log('Boletos salvos com sucesso:', boletosToSave);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Load boletos from local storage
export const loadBoletos = () => {
  try {
    const storedBoletos = localStorage.getItem(BOLETOS_STORAGE_KEY);
    if (storedBoletos) {
      // Parse dates from JSON
      const parsed = JSON.parse(storedBoletos, (key, value) => {
        // Convert date strings back to Date objects
        if (key === 'dataVencimento' || key === 'dataCadastro') {
          return new Date(value);
        }
        return value;
      });
      
      console.log('Boletos carregados com sucesso:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

// Export function to download data as JSON file
export const exportData = () => {
  try {
    const boletos = loadBoletos();
    const dataStr = JSON.stringify(boletos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    
    // Current date for filename
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    link.download = `cfc-direcao-backup-${date}.json`;
    link.href = url;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Não foi possível exportar os dados');
  }
};

// Import function to load data from uploaded JSON file
export const importData = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Falha ao ler o arquivo');
        }
        
        const parsedData = JSON.parse(event.target.result as string, (key, value) => {
          // Convert date strings back to Date objects
          if (key === 'dataVencimento' || key === 'dataCadastro') {
            return new Date(value);
          }
          return value;
        });
        
        // Validate the imported data structure
        if (!Array.isArray(parsedData)) {
          throw new Error('Formato de arquivo inválido');
        }
        
        // Save to localStorage
        saveBoletos(parsedData);
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsText(file);
  });
};
