// A simple utility to convert an array of objects to a CSV string
export const convertToCSV = (data: any[]): string => {
  if (!data || data.length === 0) {
    return "";
  }
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => JSON.stringify(row[header], (_, value) => value ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};