# Bitwig Generic BCR2000
BCR2000 CC mapping in Bitwig.

This script allows you to freely map parameters in Bitwig to your BCR2000 independently of selected track. 
It's a modification of Thomas Helzle's generic MultiBiController (https://github.com/ThomasHelzle/Toms_Bitwig_Scripts).
It had an issue with parameter value feedback loop - when tweaking an encoder on BCR2000, 
Bitwig was sending back a slightly different value to the controller resulting in jitter and sluggish value change.
The modified version is ignoring the value coming from Bitwig as long as you're still changing it on the controller.

Copy it to the Bitwig User directory: 

Windows: ~Documents\Bitwig Studio\Controller Scripts 

Mac: ~Documents/Bitwig Studio/Controller Scripts 

Linux: ~Documents/Bitwig Studio/Controller Scripts
