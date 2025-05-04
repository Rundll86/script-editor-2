@echo off
dotnet build -c Release
dotnet build -c Debug
python setup.py bdist_wheel
yarn build