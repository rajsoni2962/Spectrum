import numpy as np
import cv2
import subprocess
import imageio_ffmpeg
import math
import os

def create_hero_video():
    width = 1920
    height = 1080
    fps = 30
    duration_sec = 8
    total_frames = fps * duration_sec
    
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    out_dir = os.path.abspath('frontend/public/videos')
    os.makedirs(out_dir, exist_ok=True)
    
    mp4_path = os.path.join(out_dir, 'hero-telemetry.mp4')
    webm_path = os.path.join(out_dir, 'hero-telemetry.webm')
    poster_path = os.path.join(out_dir, 'hero-telemetry-poster.jpg')
    
    print(f'Rendering {total_frames} frames ({duration_sec}s @ {fps}fps) at {width}x{height}...')
    
    # Palette in BGR
    # Background: warm cream #FFF8F2 -> BGR(242, 248, 255) to soft blush cream #FDF0E8 -> BGR(232, 240, 253)
    # Baby Pink: #F4A6BF -> BGR(191, 166, 244)
    # Blush Rose: #D98FA8 -> BGR(168, 143, 217)
    # Deep Rose: #C06E8A -> BGR(138, 110, 192)
    # Soft Lilac: #BFA0D6 -> BGR(214, 160, 191)
    # Warm Plum Center: #664A57 -> BGR(87, 74, 102)
    # Pearl highlight: #FFF5F8 -> BGR(248, 245, 255)
    
    # Create static gradient background (warm cream with subtle radial softness)
    bg_gradient = np.zeros((height, width, 3), dtype=np.float32)
    center_x = width * 0.45
    center_y = height * 0.45
    max_diag = math.hypot(width, height) * 0.65
    
    for y in range(height):
        for x in range(width):
            dist = math.hypot(x - center_x, y - center_y) / max_diag
            dist = min(1.0, dist)
            # Center is delicate warm cream #FFFDFB, edges soft blush #FBF0E9
            b = 251 - dist * 19
            g = 253 - dist * 13
            r = 255 - dist * 4
            bg_gradient[y, x] = [b, g, r]
            
    # Pre-generate 42 nodes for rich network geometry
    np.random.seed(101)
    num_nodes = 42
    nodes = []
    
    cols = 7
    rows = 6
    dx = width / (cols + 1)
    dy = height / (rows + 1)
    
    for r in range(rows):
        for c in range(cols):
            base_x = (c + 1) * dx + np.random.uniform(-dx * 0.35, dx * 0.35)
            base_y = (r + 1) * dy + np.random.uniform(-dy * 0.35, dy * 0.35)
            
            freq_x = np.random.choice([1, 2])
            freq_y = np.random.choice([1, 2])
            amp_x = np.random.uniform(16, 38)
            amp_y = np.random.uniform(14, 34)
            phase_x = np.random.uniform(0, 2 * math.pi)
            phase_y = np.random.uniform(0, 2 * math.pi)
            
            radius = np.random.uniform(4.0, 8.5)
            node_type = np.random.choice(['baby_pink', 'rose', 'lilac'], p=[0.45, 0.35, 0.20])
            is_hub = (radius > 6.8)
            
            nodes.append({
                'base_x': base_x, 'base_y': base_y,
                'fx': freq_x, 'fy': freq_y,
                'ax': amp_x, 'ay': amp_y,
                'px': phase_x, 'py': phase_y,
                'r': radius,
                'type': node_type,
                'is_hub': is_hub
            })
            
    # Fixed edges with smooth distance cutoff
    edges = []
    max_dist = 290.0
    for i in range(num_nodes):
        for j in range(i + 1, num_nodes):
            d = math.hypot(nodes[i]['base_x'] - nodes[j]['base_x'],
                           nodes[i]['base_y'] - nodes[j]['base_y'])
            if d < max_dist:
                num_pulses = 1 if d > 190 else 2
                pulses = []
                for _ in range(num_pulses):
                    speed = np.random.choice([1, 2])
                    offset = np.random.uniform(0, 1)
                    direction = np.random.choice([1, -1])
                    pulses.append({'speed': speed, 'offset': offset, 'dir': direction})
                edges.append({'i': i, 'j': j, 'base_d': d, 'pulses': pulses})
                
    # 90 Ambient floating motes
    particles = []
    for _ in range(90):
        px0 = np.random.uniform(30, width - 30)
        py0 = np.random.uniform(30, height - 30)
        fx = np.random.choice([1, 2])
        fy = np.random.choice([1, 2])
        ax = np.random.uniform(25, 70)
        ay = np.random.uniform(20, 55)
        p_px = np.random.uniform(0, 2 * math.pi)
        p_py = np.random.uniform(0, 2 * math.pi)
        size = np.random.uniform(1.5, 3.2)
        alpha = np.random.uniform(0.35, 0.70)
        p_color = np.random.choice(['baby_pink', 'rose', 'lilac'])
        particles.append({
            'x0': px0, 'y0': py0,
            'fx': fx, 'fy': fy,
            'ax': ax, 'ay': ay,
            'px': p_px, 'py': p_py,
            'size': size, 'alpha': alpha, 'color': p_color
        })
        
    radar_hubs = [i for i, n in enumerate(nodes) if n['is_hub']][:4]
    
    cmd_mp4 = [
        ffmpeg_exe, '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{width}x{height}',
        '-pix_fmt', 'bgr24',
        '-r', str(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        mp4_path
    ]
    pipe_mp4 = subprocess.Popen(cmd_mp4, stdin=subprocess.PIPE)
    
    first_frame = None
    
    print('Encoding MP4...')
    for frame_idx in range(total_frames):
        tau = frame_idx / total_frames
        two_pi_tau = 2.0 * math.pi * tau
        
        # Start with cream background
        frame = bg_gradient.copy()
        
        # Node positions
        cur_pos = []
        for n in nodes:
            x = n['base_x'] + n['ax'] * math.sin(n['fx'] * two_pi_tau + n['px'])
            y = n['base_y'] + n['ay'] * math.cos(n['fy'] * two_pi_tau + n['py'])
            cur_pos.append((x, y))
            
        # Draw radar wave harmonics from hubs
        overlay_waves = np.zeros((height, width, 4), dtype=np.float32)
        for hub_idx in radar_hubs:
            hx, hy = cur_pos[hub_idx]
            max_r = 240.0
            for wave_k in range(3):
                w_phase = (tau + wave_k / 3.0) % 1.0
                cur_r = int(w_phase * max_r)
                if cur_r > 4:
                    fade = math.sin(math.pi * w_phase) * 0.45
                    # Rose wave: BGR(168, 143, 217)
                    cv2.circle(overlay_waves, (int(round(hx)), int(round(hy))), cur_r,
                               (168, 143, 217, fade), 1, cv2.LINE_AA)
                               
        # Draw connection edges
        overlay_edges = np.zeros((height, width, 4), dtype=np.float32)
        pulses_to_draw = []
        for e in edges:
            p1 = cur_pos[e['i']]
            p2 = cur_pos[e['j']]
            cur_d = math.hypot(p1[0] - p2[0], p1[1] - p2[1])
            if cur_d < max_dist:
                dist_factor = max(0.0, 1.0 - (cur_d / max_dist))
                # Distinct visible alpha: 0.25 to 0.65
                alpha = (dist_factor ** 1.2) * 0.62
                
                # Rose-pink line: BGR(178, 150, 225)
                b, g, r = 178, 150, 225
                pt1 = (int(round(p1[0])), int(round(p1[1])))
                pt2 = (int(round(p2[0])), int(round(p2[1])))
                cv2.line(overlay_edges, pt1, pt2, (b, g, r, alpha), 1, cv2.LINE_AA)
                
                for pulse in e['pulses']:
                    s = (pulse['offset'] + pulse['dir'] * pulse['speed'] * tau) % 1.0
                    px = (1.0 - s) * p1[0] + s * p2[0]
                    py = (1.0 - s) * p1[1] + s * p2[1]
                    pulses_to_draw.append((px, py, alpha))
                    
        # Alpha blend edges and waves onto frame
        for ov in [overlay_waves, overlay_edges]:
            alpha_ch = ov[:, :, 3:4]
            frame = frame * (1.0 - alpha_ch) + ov[:, :, :3] * alpha_ch
            
        # Draw ambient dust motes
        overlay_dust = np.zeros((height, width, 4), dtype=np.float32)
        for p in particles:
            px = p['x0'] + p['ax'] * math.sin(p['fx'] * two_pi_tau + p['px'])
            py = p['y0'] + p['ay'] * math.cos(p['fy'] * two_pi_tau + p['py'])
            alpha = p['alpha'] * (0.85 + 0.15 * math.sin(two_pi_tau * p['fx'] + p['px']))
            if p['color'] == 'rose':
                col = (138, 110, 192, alpha) # Deep Rose
            elif p['color'] == 'lilac':
                col = (214, 160, 191, alpha) # Lilac
            else:
                col = (191, 166, 244, alpha) # Baby Pink
            cv2.circle(overlay_dust, (int(round(px)), int(round(py))), int(round(p['size'])), col, -1, cv2.LINE_AA)
            
        alpha_dust = overlay_dust[:, :, 3:4]
        frame = frame * (1.0 - alpha_dust) + overlay_dust[:, :, :3] * alpha_dust
        
        # Draw flowing pulses (radiant pearls with soft glow)
        overlay_pulses = np.zeros((height, width, 4), dtype=np.float32)
        for (px, py, edge_alpha) in pulses_to_draw:
            p_alpha = min(1.0, edge_alpha * 2.2)
            ix, iy = int(round(px)), int(round(py))
            # Outer soft rose halo (radius 7)
            cv2.circle(overlay_pulses, (ix, iy), 7, (191, 166, 244, p_alpha * 0.40), -1, cv2.LINE_AA)
            # Mid core (radius 3)
            cv2.circle(overlay_pulses, (ix, iy), 3, (138, 110, 192, p_alpha * 0.85), -1, cv2.LINE_AA)
            # Bright pearl center (radius 1.5)
            cv2.circle(overlay_pulses, (ix, iy), 1, (255, 255, 255, p_alpha * 0.95), -1, cv2.LINE_AA)
            
        alpha_pulses = overlay_pulses[:, :, 3:4]
        frame = frame * (1.0 - alpha_pulses) + overlay_pulses[:, :, :3] * alpha_pulses
        
        # Draw nodes
        overlay_nodes = np.zeros((height, width, 4), dtype=np.float32)
        for i, n in enumerate(nodes):
            nx, ny = cur_pos[i]
            ix, iy = int(round(nx)), int(round(ny))
            r = n['r']
            breathe = 0.85 + 0.15 * math.sin(two_pi_tau * n['fx'] + n['px'])
            
            # Halo color & main color
            if n['type'] == 'rose':
                core_bgr = (138, 110, 192) # Deep Rose
                halo_bgr = (168, 143, 217)
            elif n['type'] == 'lilac':
                core_bgr = (190, 140, 180) # Lilac
                halo_bgr = (214, 160, 191)
            else:
                core_bgr = (175, 140, 230) # Baby Pink
                halo_bgr = (191, 166, 244)
                
            # Expanding breathing halo
            halo_r = int(round(r * 2.4 * breathe))
            cv2.circle(overlay_nodes, (ix, iy), halo_r, (*halo_bgr, 0.32 * breathe), -1, cv2.LINE_AA)
            
            # Main node body
            cv2.circle(overlay_nodes, (ix, iy), int(round(r)), (*core_bgr, 0.85), -1, cv2.LINE_AA)
            
            # Subtle dark plum inner accent ring
            if r > 5.5:
                cv2.circle(overlay_nodes, (ix, iy), int(round(r * 0.65)), (87, 74, 102, 0.60), 1, cv2.LINE_AA)
                
            # Crisp white pearl core
            cv2.circle(overlay_nodes, (ix, iy), max(2, int(round(r * 0.38))), (255, 255, 255, 0.95), -1, cv2.LINE_AA)
            
        alpha_nodes = overlay_nodes[:, :, 3:4]
        frame = frame * (1.0 - alpha_nodes) + overlay_nodes[:, :, :3] * alpha_nodes
        
        frame_u8 = np.clip(frame, 0, 255).astype(np.uint8)
        
        if frame_idx == 0:
            first_frame = frame_u8.copy()
            cv2.imwrite(poster_path, first_frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print('Saved fallback poster to', poster_path)
            
        pipe_mp4.stdin.write(frame_u8.tobytes())
        
        if (frame_idx + 1) % 60 == 0 or frame_idx == total_frames - 1:
            print(f'Rendered frame {frame_idx + 1}/{total_frames} ({int((frame_idx+1)/total_frames*100)}%)')
            
    pipe_mp4.stdin.close()
    pipe_mp4.wait()
    print('MP4 complete:', mp4_path, 'Size:', os.path.getsize(mp4_path), 'bytes')
    
    print('Encoding WebM VP9...')
    cmd_webm = [
        ffmpeg_exe, '-y',
        '-i', mp4_path,
        '-c:v', 'libvpx-vp9',
        '-b:v', '1400k',
        '-crf', '28',
        '-pix_fmt', 'yuv420p',
        webm_path
    ]
    subprocess.run(cmd_webm, check=True)
    print('WebM complete:', webm_path, 'Size:', os.path.getsize(webm_path), 'bytes')
    print('All video assets successfully generated!')

if __name__ == '__main__':
    create_hero_video()
