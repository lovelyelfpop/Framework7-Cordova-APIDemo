set fn=D:\Program Files\ImageMagick-7.0.1-9-portable-Q16-x64\convert.exe
for /f "tokens=*" %%i in ('dir/s/b *.png') do "%fn%" "%%i" -strip "%%i"

pause