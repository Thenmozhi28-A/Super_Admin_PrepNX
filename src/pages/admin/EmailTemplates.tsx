import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button as MuiButton,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  Tabs,
  Tab,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import {
  Mail,
  Wand2,
  Eye,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Quote,
  Code,
  Baseline,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import {
  useGetEmailTemplatesQuery,
  useGetEmailPreviewQuery,
  useBulkSendEmailMutation,
  useUpdateEmailTemplateMutation,
  useCreateEmailTemplateMutation
} from '../../store/api/emailApi';
import { useGetUsersQuery } from '../../store/api/userApi';
import { toast } from 'react-toastify';
import type { EmailTemplate, User } from '../../types/Types';

const EmailTemplates: React.FC = () => {
  // Queries
  const { data: emailResponse } = useGetEmailTemplatesQuery();
  const { data: usersResponse } = useGetUsersQuery({ page: 0, size: 1000 });

  const emailTemplates = emailResponse?.data || [];
  const fetchedUsers = usersResponse?.data?.content || [];

  // Mutations
  const [createTemplate, { isLoading: isCreating }] = useCreateEmailTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateEmailTemplateMutation();
  const [bulkSendEmail, { isLoading: isSending }] = useBulkSendEmailMutation();

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [refactorPrompt, setRefactorPrompt] = useState('');
  const [isRefactoring, setIsRefactoring] = useState(false);

  const [showSendModal, setShowSendModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);

  // Editor States
  const [recipientMode, setRecipientMode] = useState<'all' | 'selective'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'visual' | 'html' | 'preview'>('visual');
  const [emailBody, setEmailBody] = useState('');
  const [subjectLine, setSubjectLine] = useState('');

  // Preview Query
  const { data: previewResponse, isFetching: isPreviewLoading } = useGetEmailPreviewQuery(
    activeTemplate?.id || '',
    { skip: !showPreviewModal || !activeTemplate?.id }
  );

  // AI Integration
  const callAI = async (prompt: string) => {
    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      return data.completion;
    } catch (e) {
      console.error('AI call failed:', e);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const result = await callAI(`Generate a professional email for this request: ${aiPrompt}. Include a clear Subject line at the top starting with "Subject: ".`);
    setIsGenerating(false);
    if (result) {
      const subjectMatch = result.match(/Subject:\s*(.*)/i);
      const bodyClean = result.replace(/Subject:\s*.*\n*/i, '').trim();

      setSubjectLine(subjectMatch ? subjectMatch[1] : 'New Notification');
      setEmailBody(bodyClean);
      setAiPrompt('');
      setActiveTemplate(null);
      setShowSendModal(true);
      toast.success('Email draft generated!');
    } else {
      toast.error('AI Generation failed');
    }
  };

  const handleRefactor = async () => {
    if (!refactorPrompt || !emailBody) return;
    setIsRefactoring(true);
    const result = await callAI(`Refactor this email body based on this request: "${refactorPrompt}". \n\nCurrent Body: ${emailBody}`);
    setIsRefactoring(false);
    if (result) {
      setEmailBody(result.trim());
      setRefactorPrompt('');
      toast.success('Content refactored!');
    } else {
      toast.error('Refactor failed');
    }
  };

  const handleSave = async () => {
    try {
      if (activeTemplate) {
        await updateTemplate({
          id: activeTemplate.id,
          template: {
            subject: subjectLine,
            body: emailBody
          }
        }).unwrap();
        toast.success('Template updated successfully');
      } else {
        await createTemplate({
          name: subjectLine || 'New Template',
          subject: subjectLine,
          body: emailBody,
          status: 'INACTIVE'
        }).unwrap();
        toast.success('New template created successfully');
      }
      setShowSendModal(false);
    } catch (e) {
      toast.error('Failed to save template');
    }
  };

  const handleBulkSend = async () => {
    try {
      await bulkSendEmail({
        templateId: activeTemplate?.id,
        subject: subjectLine,
        body: emailBody,
        recipientMode,
        selectedUserIds: recipientMode === 'selective' ? selectedUsers : undefined
      }).unwrap();
      toast.success('Bulk sending initiated');
      setShowSendModal(false);
    } catch (e) {
      toast.error('Failed to initiate bulk sending');
    }
  };

  const insertVariable = (variable: string) => {
    setEmailBody(prev => prev + variable);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>Email Templates</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500 }}>Customize the system emails sent to users.</Typography>
        </Box>
      </Box>

      {/* AI Assistant Section */}
      <Paper
        sx={{
          mb: 6,
          p: 4,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
          border: '1px solid #E0E7FF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'none'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ p: 1, bgcolor: 'white', borderRadius: '10px', color: '#4F46E5', display: 'flex' }}>
              <Wand2 size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1B4B' }}>AI Email Assistant</Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#4338CA', mb: 4, fontWeight: 500 }}>
            Describe the email you want to send, and our AI will generate professional content for you.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Input
                placeholder="e.g., Happy Diwali invitation with a special discount code"
                fullWidth
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                sx={{ backgroundColor: 'white' }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<Wand2 size={18} />}
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt}
              sx={{
                height: '52px',
                borderRadius: '14px',
                px: 4,
                mb: 2,
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' }
              }}
            >
              Generate
            </Button>
          </Box>

          {isGenerating && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#4F46E5' }}>AI is thinking...</Typography>
              </Box>
              <LinearProgress
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#E0E7FF',
                  '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5' }
                }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* System Templates Table */}
      <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>System Templates</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500 }}>Manage standard email notifications.</Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid #F1F5F9' }}>
                <TableCell sx={{ fontWeight: 700, color: '#64748B', py: 2 }}>TEMPLATE NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>SUBJECT LINE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748B', textAlign: 'center' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>LAST MODIFIED</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748B', textAlign: 'right' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emailTemplates.map((template) => (
                <TableRow key={template.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 1, bgcolor: '#F1F5F9', borderRadius: '8px', color: '#64748B' }}>
                        <Mail size={16} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{template.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>{template.subject}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip
                      label={template.status === 'ACTIVE' ? 'Default' : template.status}
                      size="small"
                      sx={{
                        bgcolor: '#F1F5F9',
                        color: '#64748B',
                        fontWeight: 700,
                        borderRadius: '6px'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                      {template.lastModified ? new Date(template.lastModified).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : '1 month ago'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setActiveTemplate(template);
                          setShowPreviewModal(true);
                        }}
                      >
                        <Eye size={18} color="#64748B" />
                      </IconButton>
                      <Button
                        variant="outlined"
                        startIcon={<Pencil size={14} />}
                        onClick={() => {
                          setActiveTemplate(template);
                          setSubjectLine(template.subject);
                          setEmailBody(template.body);
                          setShowSendModal(true);
                        }}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          borderColor: '#E2E8F0',
                          color: '#0F172A',
                          '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' }
                        }}
                      >
                        Edit Content
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Template Modal */}
      <Dialog
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', p: 1 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
                {activeTemplate ? `Edit Template: ${activeTemplate.name}` : 'Create New Template'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                Customize the email content and subject line.
              </Typography>
            </Box>
            <IconButton onClick={() => setShowSendModal(false)}><X size={20} /></IconButton>
          </Box>

          <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: 'none', mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Recipients</Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <ToggleButtonGroup
                value={recipientMode}
                exclusive
                onChange={(_, val) => val && setRecipientMode(val)}
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: '8px',
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#64748B',
                    '&.Mui-selected': {
                      bgcolor: '#2563EB',
                      color: 'white',
                      '&:hover': { bgcolor: '#1D4ED8' }
                    }
                  }
                }}
              >
                <ToggleButton value="all">All Users</ToggleButton>
                <ToggleButton value="selective">Selective Users</ToggleButton>
              </ToggleButtonGroup>

              {recipientMode === 'selective' && (
                <Select
                  multiple
                  size="small"
                  value={selectedUsers}
                  onChange={(e) => setSelectedUsers(e.target.value as string[])}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected.length === 0) return <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>Select users...</Typography>;
                    return `${selected.length} users selected`;
                  }}
                  sx={{ minWidth: 200, borderRadius: '10px' }}
                >
                  {fetchedUsers.map((u: User) => (
                    <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
                  ))}
                </Select>
              )}
            </Box>
          </Paper>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Subject Line</Typography>
            <Input
              fullWidth
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Email Body</Typography>
                <Tabs
                  value={activeTab}
                  onChange={(_, val) => setActiveTab(val)}
                  sx={{
                    minHeight: 0,
                    '& .MuiTab-root': {
                      minHeight: 0,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      px: 2,
                      py: 1,
                      color: '#64748B',
                    }
                  }}
                >
                  <Tab label="Visual Editor" value="visual" />
                  <Tab label="HTML Source" value="html" />
                  <Tab label="Preview" value="preview" />
                </Tabs>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['{user_name}', '{company_name}', '{login_url}'].map((v) => (
                  <Chip
                    key={v}
                    label={v}
                    onClick={() => insertVariable(v)}
                    sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem', height: '28px' }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
              {/* AI Refactor Input */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Box sx={{ color: '#4F46E5', display: 'flex' }}><Sparkles size={20} /></Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask AI to refactor (e.g., 'Make it more formal' or 'Add a bullet list for features')"
                  value={refactorPrompt}
                  onChange={(e) => setRefactorPrompt(e.target.value)}
                  slotProps={{
                    input: { sx: { bgcolor: 'white', borderRadius: '10px' } }
                  }}
                />
                <Button
                  disabled={isRefactoring || !refactorPrompt}
                  onClick={handleRefactor}
                  sx={{ borderRadius: '10px', textTransform: 'none', px: 3, bgcolor: '#F1F5F9', color: '#64748B', '&:hover': { bgcolor: '#E2E8F0' } }}
                >
                  {isRefactoring ? 'Thinking...' : 'Refactor'}
                </Button>
              </Box>

              {/* Editor Content */}
              {activeTab === 'visual' && (
                <>
                  <Box sx={{ p: 1, bgcolor: '#F9FAFB', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Select size="small" defaultValue="Normal" sx={{ width: 100, height: 32, fontSize: '0.75rem', borderRadius: '6px' }}>
                      <MenuItem value="Normal">Normal</MenuItem>
                      <MenuItem value="H1">Heading 1</MenuItem>
                    </Select>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <IconButton size="small"><Bold size={16} /></IconButton>
                    <IconButton size="small"><Italic size={16} /></IconButton>
                    <IconButton size="small"><Underline size={16} /></IconButton>
                    <IconButton size="small"><Baseline size={16} /></IconButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <IconButton size="small"><List size={16} /></IconButton>
                    <IconButton size="small"><ListOrdered size={16} /></IconButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <IconButton size="small"><AlignLeft size={16} /></IconButton>
                    <IconButton size="small"><AlignCenter size={16} /></IconButton>
                    <IconButton size="small"><AlignRight size={16} /></IconButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <IconButton size="small"><LinkIcon size={16} /></IconButton>
                    <IconButton size="small"><Quote size={16} /></IconButton>
                    <IconButton size="small"><Code size={16} /></IconButton>
                  </Box>
                  <TextField
                    multiline
                    rows={12}
                    fullWidth
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    variant="standard"
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: { p: 3, fontSize: '0.9375rem', lineHeight: 1.6, color: '#334155' }
                      }
                    }}
                  />
                </>
              )}

              {activeTab === 'html' && (
                <TextField
                  multiline
                  rows={12}
                  fullWidth
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  variant="standard"
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      sx: { p: 3, fontSize: '0.875rem', fontFamily: 'monospace', bgcolor: '#F8FAFC', color: '#0F172A' }
                    }
                  }}
                />
              )}

              {activeTab === 'preview' && (
                <Box sx={{ p: 4, height: 400, overflowY: 'auto' }}>
                  <div dangerouslySetInnerHTML={{ __html: emailBody }} />
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <MuiButton
              onClick={() => setShowSendModal(false)}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#64748B' }}
            >
              Cancel
            </MuiButton>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <MuiButton
                variant="outlined"
                onClick={handleSave}
                disabled={isUpdating || isCreating}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, borderColor: '#E2E8F0', color: '#0F172A' }}
              >
                {activeTemplate ? 'Update Template' : 'Save as New Template'}
              </MuiButton>
              <Button
                variant="contained"
                onClick={handleBulkSend}
                disabled={isSending}
                sx={{ borderRadius: '12px', px: 4, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
              >
                Send to {recipientMode === 'all' ? 'All' : selectedUsers.length} Users
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Preview Modal */}
      <Dialog
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px' } } }}
      >
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
                Preview: {activeTemplate?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                This is how the email will look to recipients.
              </Typography>
            </Box>
            <IconButton onClick={() => setShowPreviewModal(false)}><X size={20} /></IconButton>
          </Box>

          <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none', mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E2937', mb: 1 }}>
              Subject: <Box component="span" sx={{ fontWeight: 500, color: '#64748B' }}>{activeTemplate?.subject}</Box>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E2937' }}>
              From: <Box component="span" sx={{ fontWeight: 500, color: '#64748B' }}>TeamsHub &lt;notifications@teamshub.com&gt;</Box>
            </Typography>
          </Paper>

          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: 'white', minHeight: 400, position: 'relative', overflow: 'hidden' }}>
            {isPreviewLoading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ borderRadius: 4, height: 6 }} />
              </Box>
            ) : (
              <Box sx={{ p: 0, height: 500, overflowY: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: previewResponse?.data || '<p>No preview content</p>' }} />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <MuiButton
              onClick={() => setShowPreviewModal(false)}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#64748B' }}
            >
              Close
            </MuiButton>
            <Button
              variant="contained"
              onClick={() => {
                setShowPreviewModal(false);
                setSubjectLine(activeTemplate?.subject || '');
                setEmailBody(activeTemplate?.body || '');
                setShowSendModal(true);
              }}
              sx={{ borderRadius: '12px', px: 4, bgcolor: '#2563EB' }}
            >
              Edit Template
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default EmailTemplates;
