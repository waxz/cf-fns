#ifndef MY_STDINT_H
#define MY_STDINT_H

#ifndef __SIZE_TYPE__
typedef unsigned int size_t;
#endif

#ifndef __PTRDIFF_TYPE__
typedef int ptrdiff_t;
#endif

typedef unsigned char  uint8_t;
typedef signed char    int8_t;
typedef unsigned short uint16_t;
typedef signed short   int16_t;
typedef unsigned int   uint32_t;
typedef signed int     int32_t;
typedef unsigned long long uint64_t;
typedef signed long long   int64_t;

#endif /* MY_STDINT_H */
