#!/usr/bin/env python3
"""Double-fork daemon to keep Next.js running persistently."""
import os, sys, time, signal, subprocess

def daemonize():
    """Double-fork to fully detach from terminal."""
    pid = os.fork()
    if pid > 0:
        os._exit(0)
    os.setsid()
    pid = os.fork()
    if pid > 0:
        os._exit(0)
    os.chdir('/home/z/my-project')
    os.umask(0)
    # Close standard file descriptors
    sys.stdout.flush()
    sys.stderr.flush()
    devnull = open(os.devnull, 'r')
    os.dup2(devnull.fileno(), 0)

def main():
    daemonize()
    log = open('/home/z/my-project/server-daemon.log', 'a')
    os.dup2(log.fileno(), 1)
    os.dup2(log.fileno(), 2)
    
    while True:
        log.write(f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] Starting Next.js...\n')
        log.flush()
        try:
            proc = subprocess.Popen(
                ['node', 'node_modules/.bin/next', 'dev', '-p', '3000'],
                cwd='/home/z/my-project',
                stdout=log,
                stderr=log
            )
            proc.wait()
            log.write(f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] Server exited with code {proc.returncode}. Restarting in 3s...\n')
            log.flush()
        except Exception as e:
            log.write(f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] Error: {e}. Restarting in 3s...\n')
            log.flush()
        time.sleep(3)

if __name__ == '__main__':
    main()
