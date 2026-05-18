'use client';
import { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, CheckCircle2, ChevronRight, Download, Users } from 'lucide-react';
import { parseCSV, type ParseResult, type ParsedRow } from '@/lib/import-parser';
import { triggerCredentialsDownload } from '@/lib/credentials-export';
import { importHackathonParticipants } from '@/app/actions/hackathon';
import type { Hackathon, HackathonParticipant, HackathonTeam } from '@/types';
import styles from './ImportWizard.module.css';

interface Props {
  hackathon: Hackathon;
  existingParticipants: HackathonParticipant[];
  onImportComplete: (teams: HackathonTeam[]) => void;
}

export default function ImportWizard({ hackathon, existingParticipants, onImportComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<{ created: number; skipped: number; errors: string[]; credentials?: any[] } | null>(null);
  const [importedTeams, setImportedTeams] = useState<HackathonTeam[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingEmails = new Set(
    existingParticipants.map(p => p.userId) // User ID tracking will have to happen dynamically, or just empty set for UI
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const text = await selected.text();
    const result = parseCSV(text);
    setParseResult(result);
    setStep(2);
  }

  async function startImport() {
    if (!parseResult || parseResult.errors.length > 0) return;
    setImporting(true);

    try {
      // Map the parsed rows to match what the server action expects
      const payload = parseResult.rows.map(r => ({
        name: r.name,
        email: r.email,
        team_name: r.teamName,
        role: r.role,
        college: r.college,
        branch: r.branch,
        year: r.year ? r.year.toString() : '1'
      }));

      const result = await importHackathonParticipants(hackathon.id, payload);
      setImportStats({ 
        created: result.created, 
        skipped: result.skipped, 
        errors: result.errors,
        credentials: result.credentials 
      });
      
      setImportedTeams([]);
      setStep(3);
      if (result.created > 0 || result.skipped > 0) {
        onImportComplete([]); 
      }
    } catch (err) {
      console.error(err);
      setImportStats({ created: 0, skipped: 0, errors: ['An unexpected error occurred during import.'] });
      setStep(3);
    } finally {
      setImporting(false);
    }
  }

  function downloadCredentials() {
    if (!importStats?.credentials || importStats.credentials.length === 0) return;
    
    const headers = 'Name,Email,Team,Role,Password\n';
    const rows = importStats.credentials.map(c => 
      `"${c.Name}","${c.Email}","${c.Team}","${c.Role}","${c.Password}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Hackathon_Credentials_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStep(4);
  }

  return (
    <div className={styles.wizard}>
      {/* Steps indicator */}
      <div className={styles.steps}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`${styles.step} ${step >= s ? styles.stepActive : ''}`}>
            <div className={styles.stepNum}>{s}</div>
            <div className={styles.stepLabel}>
              {s === 1 && 'Upload'}
              {s === 2 && 'Preview'}
              {s === 3 && 'Import'}
              {s === 4 && 'Credentials'}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className={styles.uploadArea}>
            <UploadCloud size={48} className={styles.uploadIcon} />
            <h3 className={styles.uploadTitle}>Upload Participants CSV</h3>
            <p className={styles.uploadSub}>
              File must contain columns: <br />
              <code className={styles.code}>name, email, team_name, role</code>
            </p>
            <p className={styles.uploadHint}>Role must be "leader" or "member". Exactly one leader per team.</p>
            
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              Select CSV File
            </button>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 2 && parseResult && (
          <div className={styles.previewArea}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Preview Import Data</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => { setFile(null); setParseResult(null); setStep(1); }}>
                Choose different file
              </button>
            </div>

            {parseResult.errors.length > 0 && (
              <div className={styles.errorBox}>
                <div className={styles.errorHeader}>
                  <AlertCircle size={16} /> Found {parseResult.errors.length} errors
                </div>
                <ul className={styles.errorList}>
                  {parseResult.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>{e.message}</li>
                  ))}
                  {parseResult.errors.length > 5 && (
                    <li>...and {parseResult.errors.length - 5} more. Fix the file and re-upload.</li>
                  )}
                </ul>
              </div>
            )}

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Team</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.rows.slice(0, 10).map(r => (
                    <tr key={r._rowIndex} className={existingEmails.has(r.email) ? styles.rowSkipped : ''}>
                      <td>{r._rowIndex}</td>
                      <td>{r.name}</td>
                      <td>
                        {r.email}
                        {existingEmails.has(r.email) && <span className={styles.badgeWarning} style={{marginLeft: 8}}>Already in Hackathon</span>}
                      </td>
                      <td>{r.teamName}</td>
                      <td>
                        <span className={`badge ${r.role === 'leader' ? 'badge-primary' : 'badge-neutral'}`}>
                          {r.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parseResult.rows.length > 10 && (
                <div className={styles.tableMore}>Showing 10 of {parseResult.rows.length} rows</div>
              )}
            </div>

            <div className={styles.actions}>
              <button 
                className="btn btn-primary" 
                onClick={startImport} 
                disabled={parseResult.errors.length > 0 || importing}
              >
                {importing ? 'Importing...' : `Import ${parseResult.rows.length} participants`} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 & 4: SUCCESS & DOWNLOAD */}
        {step >= 3 && importStats && (
          <div className={styles.successArea}>
            {importStats.errors.length === 0 ? (
              <CheckCircle2 size={64} className={styles.successIcon} />
            ) : (
              <AlertCircle size={64} className={styles.warningIcon} />
            )}
            
            <h3 className={styles.successTitle}>Import Complete</h3>
            
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{importStats.created}</div>
                <div className={styles.statLabel}>Accounts Created</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{importedTeams.length}</div>
                <div className={styles.statLabel}>Teams Formed</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{importStats.skipped}</div>
                <div className={styles.statLabel}>Skipped (Existed)</div>
              </div>
            </div>

            {importStats.errors.length > 0 && (
              <div className={styles.errorBox} style={{marginTop: 'var(--space-4)'}}>
                <ul className={styles.errorList}>
                  {importStats.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className={styles.downloadBox}>
              <p className={styles.downloadHint}>
                Download the credentials sheet. It contains auto-generated passwords and login instructions for all imported teams. 
                <br/><strong>Store this safely — you cannot retrieve plain text passwords later.</strong>
              </p>
              
              {step === 3 ? (
                <button className="btn btn-primary" onClick={downloadCredentials}>
                  <Download size={16} /> Download Credentials CSV
                </button>
              ) : (
                <div className={styles.downloadSuccess}>
                  <CheckCircle2 size={16} /> Credentials Downloaded
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
