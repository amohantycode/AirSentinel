import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'latest';
    const date = searchParams.get('date');
    const location = searchParams.get('location');
    const pollutant = searchParams.get('pollutant');

    // Build Python command
    const scriptPath = path.join(process.cwd(), 'scripts', 'load-2025-data.py');
    const venvPath = path.join(process.cwd(), 'venv', 'bin', 'activate');
    
    let command = `source ${venvPath} && python ${scriptPath}`;
    
    if (mode === 'date' && date) {
      command += ` date ${date}`;
    } else if (mode === 'history' && location) {
      command += ` history "${location}"`;
      if (pollutant) {
        command += ` ${pollutant}`;
      }
    } else {
      command += ' latest';
    }

    // Execute Python script
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('FutureWarning')) {
      console.error('Python script error:', stderr);
    }

    // Parse JSON output
    const data = JSON.parse(stdout);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      source: '2025 DMV Historical Data'
    });

  } catch (error) {
    console.error('Error loading 2025 data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load 2025 data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
