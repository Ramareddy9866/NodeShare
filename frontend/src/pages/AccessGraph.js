import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, MenuItem, Select, FormControl, Stack, Button, InputLabel } from '@mui/material';
import axios from 'axios';
import { Network } from 'vis-network/standalone';
import { API_BASE_URL } from '../config';
import AppAlert from '../components/AppAlert';

export default function AccessGraph() {
  const { fileId } = useParams();
  const visRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [owner, setOwner] = useState(null);
  const [edges, setEdges] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [path, setPath] = useState([]);
  const [pathError, setPathError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const PATH_COLOR = '#F59E42'; // orange for path highlight

  // load access graph data
  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('token');
        // get access list and file info
        const fileRes = await axios.get(`${API_BASE_URL}/files/${fileId}/access-list`, { headers: { Authorization: 'Bearer ' + token } });
        setFile(fileRes.data.file);
        setOwner(fileRes.data.file ? fileRes.data.file.owner : null);
        setUsers(fileRes.data.authorizedUsers);
        // get access edges
        const edgesRes = await axios.get(`${API_BASE_URL}/files/${fileId}/access-edges`, { headers: { Authorization: 'Bearer ' + token } });
        setEdges(edgesRes.data.edges);
      } catch (err) {
        setError('Failed to load access graph');
      }
      setLoading(false);
    };
    fetchGraph();
  }, [fileId]);

  // get current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // decode JWT payload
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        setCurrentUserId(payload.id);
      } catch {}
    }
  }, []);

  // render network graph
  useEffect(() => {
    if (!loading && users.length > 0 && visRef.current) {
      // create nodes with colors
      const pathNodeIds = path && path.length > 0 ? path.map(u => u._id) : [];
      const nodes = users.map(u => ({
        id: u.user._id,
        label: u.user.username,
        color:
          pathNodeIds.includes(u.user._id)
            ? PATH_COLOR
            : u.user._id === (owner || '').toString()
            ? '#1E3A8A'
            : u.user._id === currentUserId
            ? '#38BDF8'
            : undefined
      }));
      let visEdges = edges.map(e => ({ from: e.from, to: e.to, arrows: 'to' }));
      // highlight path edges
      if (pathNodeIds.length > 1) {
        for (let i = 0; i < pathNodeIds.length - 1; i++) {
          const from = pathNodeIds[i];
          const to = pathNodeIds[i + 1];
          // find and color the edge
          const edge = visEdges.find(e => e.from === from && e.to === to);
          if (edge) edge.color = { color: PATH_COLOR, highlight: PATH_COLOR, inherit: false };
          else visEdges.push({ from, to, color: { color: PATH_COLOR, highlight: PATH_COLOR, inherit: false }, arrows: 'to' });
        }
      }
      const data = { nodes, edges: visEdges };
      const options = { nodes: { shape: 'dot', size: 20, font: { size: 16 } }, edges: { arrows: 'to' }, physics: false };
      new Network(visRef.current, data, options);
    }
  }, [loading, users, edges, owner, currentUserId, path]);

  // fetch access path for selected user
  const handlePathFetch = async () => {
    setPath([]); setPathError('');
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/files/${fileId}/why/${selectedUser}`, { headers: { Authorization: 'Bearer ' + token } });
      setPath(res.data.path);
    } catch (err) {
      setPathError(err.response?.data?.message || 'No path found');
    }
  };

  return (
    <Container>
      <Box mt={4}>
        {!loading && users.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6">Access Route from Owner</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>User</InputLabel>
                <Select
                  value={selectedUser}
                  label="User"
                  onChange={e => setSelectedUser(e.target.value)}
                >
                  {users.map(u => (
                    <MenuItem key={u.user._id} value={u.user._id}>{u.user.username}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handlePathFetch} disabled={!selectedUser}>Show Path</Button>
            </Stack>
            {pathError && <AppAlert severity="error" sx={{ mt: 2 }}>{pathError}</AppAlert>}
            {path.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle1">Access Path:</Typography>
                <Typography>
                  {path.map((u, i) => (
                    <span key={u._id}>{u.username}{i < path.length - 1 && ' → '}</span>
                  ))}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        <Typography variant="h5" align="center" sx={{ fontWeight: 600, mb: 2 }}>ACCESS GRAPH</Typography>
        {loading ? <CircularProgress /> : error ? <AppAlert severity="error">{error}</AppAlert> : (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'left' }}>File: {file?.originalname}</Typography>
            <Box ref={visRef} sx={{ height: 400, border: '1px solid #ccc' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Note: The access graph may extend further, but you can only see the portion relevant to your access.
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
} 