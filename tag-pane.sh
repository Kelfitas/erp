#!/bin/sh

# usage: no_scroll_line top|bottom 'non-scrolling line content' command to run with args
#
#     Set up a non-scrolling line at the top (or the bottom) of the
#     terminal, write the given text into it, then (in the scrolling
#     region) run the given command with its arguments. When the
#     command has finished, pause with a prompt and reset the
#     scrolling region.

get_size() {
    set -- $(stty size)
    LINES=$1
    COLUMNS=$2
}
set_nonscrolling_line() {
    get_size
    case "$1" in
        t|to|top)
            non_scroll_line=0
            first_scrolling_line=1
            scroll_region="1 $(($LINES - 1))"
            ;;
        b|bo|bot|bott|botto|bottom)
            first_scrolling_line=0
            scroll_region="0 $(($LINES - 2))"
            non_scroll_line="$(($LINES - 1))"
            ;;
        *)
            echo 'error: first argument must be "top" or "bottom"'
            exit 1
            ;;
    esac
    clear
    tput csr $scroll_region
    tput cup "$non_scroll_line" 0
    
    # see tmux-colors.png for more colors
    # color=125 # 0-255

    # Color {code}	Color
    # 0	            Black
    # 1	            Red
    # 2	            Green
    # 3	            Yellow
    # 4	            Blue
    # 5	            Magenta
    # 6	            Cyan
    # 7	            White
    color=$(tput setab 6; tput setaf 0)
    
    printf "\x1b[38;5;${color} ${2} \x1b[0m\n"
    
    tput cup "$first_scrolling_line" 0
}
reset_scrolling() {
    get_size
    clear
    tput csr 0 $(($LINES - 1))
}

# Set up the scrolling region and write into the non-scrolling line
set_nonscrolling_line "$1" "$2"
shift 2

# Run something that writes into the scolling region
"$@"
ec=$?

# Reset the scrolling region
printf %s 'Press ENTER to reset scrolling (will clear screen)'
read a_line
reset_scrolling

exit "$ec"